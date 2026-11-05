<template>
  <el-container v-if="dg.groupCode" class="szd-ai-chat">
    <!-- 侧边栏 -->
    <el-aside v-show="dg.showSidebar" class="szd-ai-chat__sidebar">
      <!-- 个人设置 -->
      <div class="sidebar__tool">
        <el-tooltip content="刷新" placement="top" effect="light">
          <el-icon @click="initData" class="icon"><Refresh /></el-icon>
        </el-tooltip>
        <el-tooltip content="会话数据" placement="top" effect="light">
          <el-icon @click="handlePerHisData" class="icon"><Histogram /></el-icon>
        </el-tooltip>
        <el-tooltip content="个人设置" placement="top" effect="light">
          <el-icon @click="handlePerSetting" class="icon"><Setting /></el-icon>
        </el-tooltip>
        <el-tooltip content="帮助" placement="top" effect="light">
          <el-icon @click="handleHelp" class="icon"><Warning /></el-icon>
        </el-tooltip>
      </div>
      <!-- 会话组名称 -->
      <div class="sidebar__brand">{{ config.header.groupName }}</div>
      <!-- 会话类型 -->
      <div class="sidebar__mode">
        <button
          type="button"
          @click="handleClickMode('chat')"
          class="sidebar__mode-btn"
          :class="{ 'sidebar__mode-btn--active': dg.chatMode === 'chat' }">
          {{ $t("智能对话") }}
        </button>
        <button
          type="button"
          @click="handleClickMode('task')"
          class="sidebar__mode-btn"
          :class="{ 'sidebar__mode-btn--active': dg.chatMode === 'task' }">
          {{ $t("自动任务") }}
        </button>
      </div>
      <!-- 新建会话/新建任务 -->
      <el-button type="primary" plain @click="handleSessionNew" class="sidebar__new-btn">
        {{ dg.chatMode === "chat" ? $t("新建会话") : $t("新建任务") }}
      </el-button>
      <!-- 搜索会话 -->
      <el-input v-model="dg.searchTitle" clearable :placeholder="$t('搜索会话')" @change="getSession" class="sidebar__new-input" />
      <!-- 会话清单 -->
      <aiChatSidebarMenu
        v-if="dg.chatMode === 'chat'"
        ref="refAiChatSidebarMenu"
        :menuList="sessionChatList"
        :mDg="dg"
        @handleEvent="handleEventMenu" />
      <!-- 自动任务 -->
      <aiChatSidebarMenu v-else ref="refAiChatSidebarMenu" :menuList="sessionTaskList" :mDg="dg" @handleEvent="handleEventMenu" />
    </el-aside>
    <!-- 会话功能 -->
    <el-main class="szd-ai-chat__main">
      <!-- 会话标题 -->
      <div class="szd-ai-chat__main-bland">
        <!-- 折叠按钮 -->
        <div class="bland__btn">
          <el-icon v-if="dg.showSidebar" @click="dg.showSidebar = false"><Fold /></el-icon>
          <el-icon v-else @click="dg.showSidebar = true"><Expand /></el-icon>
        </div>
        <!-- 标题 -->
        <div class="title">
          <span v-if="sessionObj.sessionId"> {{ sessionObj.title || $t("会话未命名") }}</span>
          <span v-else style="color: #409eff"> {{ $t("请选择会话") }}</span>
          <span class="subtitle"> {{ $t("AI 生成可能有误 注意核实") }}</span>
        </div>
      </div>
      <!-- 连接错误 -->
      <el-alert v-if="sessionObj.$aiError" :description="sessionObj.$aiError" type="error" show-icon />
      <!-- 会话内容 -->
      <aiChatMainContent
        ref="refAiChatMainContent"
        :sessionObj="sessionObj"
        :contentList="contentList"
        :contentPage="contentPage"
        :contentDataSt="contentDataSt"
        :contextSelected="contextSelected"
        :aiDomObj="_aiDomObj"
        :bsDataObj="_bsDataObj"
        :aiLay="_aiLay"
        :szdopt="szdopt"
        @handleEvent="handleEventContent"
        @refresh="getSessionContent" />
      <!-- 对话 -->
      <aiChatMainSender
        ref="refAiChatMainSender"
        :config="config"
        :sessionObj="sessionObj"
        :contextSelected="contextSelected"
        :bsDataObj="_bsDataObj"
        :bsPage="_bsPageData.page"
        :mDg="dg"
        @send="handleSenderSend"
        @stop="handleSenderStop"
        @select-file="handleSenderSelectFile"
        @remove-file="handleSenderRemoveFile" />
    </el-main>

    <!-- 编辑会话 -->
    <perSetting ref="rePerSetting" @refresh="initData" />
    <perHisData ref="refPerHisData" @refresh="initData" />
    <helpInfo ref="refHelpInfo" />
    <aiChatSidebarMenuChat ref="refAiChatSidebarMenuChat" :mDg="dg" :aiLay="_aiLay" @handleEvent="handleEventMenu" />
    <aiChatSidebarMenuTask ref="refAiChatSidebarMenuTask" :mDg="dg" :aiLay="_aiLay" :config="config" @handleEvent="handleEventMenu" />
  </el-container>
  <div v-else-if="dg.paramError" style="padding: 10px 50px">
    <el-alert :title="$t('会话组获取失败')" :description="JSON.stringify(props.aiLay)" type="error" show-icon :closable="false" />
  </div>
</template>

<script setup>
  import "./css/index.scss";
  import { ref, onBeforeMount, computed, nextTick, watch } from "vue";
  import store from "~store";
  import { $mE, $t } from "../../common/utils/globalConfig";
  import szdTool from "../../common/tools/tool";
  import { getAiConfig, getAiSession, getAiSessionContent } from "./api/aiChat";
  import { senderRemoveFile, senderSelectFile } from "./js/aiChatFile";
  import { getBsDataSend, getBtnModeCode, senderSend, senderStop, senderRecovery, updDataJsonSt } from "./js/aiChatSSE";
  import { initAiDom, initAiLay } from "./js/aiChatInit";
  import { processDataCollect } from "./js/aiChatResultCollect";
  import { processDataAnalySend } from "./js/aiChatResultAnalySend";
  import aiChatSidebarMenu from "./sub/aiChatSidebarMenu.vue";
  import aiChatSidebarMenuChat from "./sub/aiChatSidebarMenuChat.vue";
  import aiChatSidebarMenuTask from "./sub/aiChatSidebarMenuTask.vue";
  import aiChatMainContent from "./sub/aiChatMainContent.vue";
  import aiChatMainSender from "./sub/aiChatMainSender.vue";
  import perSetting from "./perSetting/perSetting.vue";
  import perHisData from "./perHisData/perHisData.vue";
  import helpInfo from "./helpInfo/helpInfo.vue";

  const loginUser = store.state.loginUser.user;
  //子屏幕
  const refAiChatMainContent = ref();
  const refAiChatMainSender = ref();
  const rePerSetting = ref();
  const refPerHisData = ref();
  const refAiChatSidebarMenu = ref();
  const refAiChatSidebarMenuChat = ref();
  const refAiChatSidebarMenuTask = ref();
  const refHelpInfo = ref();

  const emit = defineEmits(["aiEvent", "update:data"]);

  const props = defineProps({
    //业务数据
    data: {
      type: [Object, Array]
    },
    //total总条数
    total: {
      type: Number,
      default: 0
    },
    //ai参数
    aiLay: {
      type: Object,
      default: () => ({})
    },
    //ai字段
    aiFst: {
      type: [Object, Array, String]
    },
    //编辑操作
    szdopt: {
      type: String,
      default: "U"
    },
    //回调方法
    callMethod: {
      type: Function,
      default: null
    }
  });

  //窗口参数
  const dg = ref({
    groupCode: "", // 会话组代码
    groupName: "",
    routerCode: "",
    userId: loginUser.userId,
    userName: loginUser.userName,
    showSidebar: true, // 显示侧边栏
    chatMode: "chat", //对话模式[chat智能对话,task自动任务]
    searchTitle: "", // 搜索会话查询
    paramError: false
  });
  //会话组配置
  const config = ref({
    header: { groupCode: "", groupName: "", groupCheckAuth: false, pageSizes: [] },
    promptList: [],
    btnList: []
  });
  //会话清单
  const sessionChatList = ref([]); // 会话清单
  const sessionTaskList = ref([]); // 任务清单
  //激活会话
  const sessionObj = ref({});
  //会话内容
  const contentList = ref([]);
  const contentDataSt = ref({});
  const contextSelected = ref({});
  //会话内容分页
  const contentPage = ref({ pageNum: 1, pageSize: 50, total: 0 });
  //ai参数
  const _aiLay = computed(() => {
    return initAiLay(props.aiLay);
  });
  //与Ai交互的字段状态
  const _aiFst = ref();
  //程序内部使用的DOM和全局配置
  const _aiDomObj = ref({ collectDom: [], globalConfig: [] });
  //业务数据
  const _bsDataObj = computed({
    get: () => props.data,
    set: val => {
      emit("update:data", val);
    }
  });
  //业务数据分页
  const _bsPageData = ref({
    page: { pageNum: 1, pageSize: 100, total: 0, pageSizes: [100, 500, 1000, 10000] },
    pagePrev: { pageNum: undefined, pageSize: undefined, total: 0 },
    dataList: []
  });
  //获取字段状态
  watch(
    () => [_aiLay.value, props.aiFst],
    () => {
      initAiDom(_aiLay.value, props.aiFst, _aiFst, _aiDomObj);
    },
    { immediate: true, deep: true }
  );

  //初始化数据
  onBeforeMount(() => {
    dg.value.paramError = false;
    if (_aiLay.value.groupCode || _aiLay.value.routerCode) {
      initData();
      initAiGlobalConfig();
    } else {
      $mE("会话组代码或路由代码不能为空");
      dg.value.paramError = true;
    }
  });
  //初始化数据
  const initData = async () => {
    initDataSessionParam();
    await initConfig();
    await getSession();
  };
  //初始化数据对象
  const initDataSessionParam = () => {
    senderStop(sessionObj.value, false);
    sessionObj.value = {
      sessionId: "",
      taskType: "",
      title: "",
      fileList: [],
      //程序内部参数
      $skill: { skillCode: "", skillName: "", skillSql: "" },
      $aiError: "",
      $senderBtnMode: "", //功能模式
      $senderBtnCode: "", //功能按钮
      $senderDisabled: false, //会话禁用
      $senderLoading: false, //数据加载中
      $senderDomData: false, //业务数据
      $senderTurns: 10, //上下文有效轮次
      $senderContextMsgIds: []
    };
    contentList.value = [];
    contentDataSt.value = {};
    contextSelected.value = {};
    handleClickMode(dg.value.chatMode);
  };
  //获取会话组配置
  const initConfig = () => {
    return getAiConfig({ groupCode: _aiLay.value.groupCode, routerCode: _aiLay.value.routerCode, userId: dg.value.userId }).then(res => {
      if (res && res.code === 200 && res.data) {
        config.value.header = res.data.header;
        config.value.promptList = res.data.promptList || [];
        config.value.btnList = res.data.btnList || [];
        dg.value.groupCode = config.value.header.groupCode || "";
        dg.value.groupName = config.value.header.groupName || "";
        dg.value.routerCode = _aiLay.value.routerCode || "";
        _bsPageData.value.page.pageSizes = config.value.header.pageSizes || [100, 500, 1000, 10000];
        _bsPageData.value.page.pageSize = _bsPageData.value.page.pageSizes[0];
        _bsPageData.value.page.pageNum = 1;
        if (_bsPageData.value.pagePrev.total > 0) {
          _bsPageData.value.page.total = _bsPageData.value.pagePrev.total;
        } else {
          _bsPageData.value.page.total = props.callMethod && _aiLay.value.showPage && props.total && props.total > 0 ? props.total : 0;
        }
      } else {
        $mE("会话组获取失败");
        dg.value.paramError = true;
      }
    });
  };
  //初始化AI配置
  const initAiGlobalConfig = () => {
    szdTool.getGlobalList("SKIS_AI_CHAT_CONFIG").then(res => {
      _aiDomObj.value.globalConfig = res || [];
    });
  };
  //获取会话清单
  const getSession = obj => {
    if (!dg.value.groupCode) return;
    return getAiSession({ userId: dg.value.userId, groupCode: dg.value.groupCode, title: dg.value.searchTitle })
      .then(res => {
        let sTemp = null;
        if (res && res.code === 200) {
          sessionChatList.value = res.data.chatList;
          sessionTaskList.value = res.data.taskList;
          const _sId = obj?.fCode === "sessionAdd" && obj?.sessionObj?.sessionId ? obj.sessionObj.sessionId : sessionObj.value.sessionId;
          const _sMd = obj?.fCode === "sessionAdd" && obj?.sessionObj?.sessionId ? dg.value.chatMode : sessionObj.value.taskType ? "task" : "chat";
          //检查打开的会话是否存在
          if (_sId) {
            if (_sMd === "task") {
              sTemp = sessionTaskList.value.find(r => r.sessionId === _sId);
            } else {
              sTemp = sessionChatList.value.find(r => r.sessionId === _sId);
            }
            if (sTemp) {
              sTemp.$aiError = sessionObj.value.$aiError;
              sTemp.$senderBtnCode = sessionObj.value.$senderBtnCode;
              sTemp.$senderDisabled = sessionObj.value.$senderDisabled;
              sTemp.$senderLoading = sessionObj.value.$senderLoading;
              sTemp.$senderTurns = sessionObj.value.$senderTurns;
              sessionObj.value = sTemp;
              handleClickMode(dg.value.chatMode);
            }
          }
        }
        if (!sTemp) initDataSessionParam();
      })
      .catch(() => {
        initDataSessionParam();
      });
  };
  //获取会话内容
  const getSessionContent = obj => {
    //首次加载会话内容
    if (obj?.sessionObj) {
      senderStop(sessionObj.value, false);
      sessionObj.value = obj.sessionObj;
      sessionObj.value.$senderTurns = obj.sessionObj.contextTurns;
      contentPage.value.pageNum = 1;
      contentList.value = [];
      contentDataSt.value = {};
      contextSelected.value = {};
    }
    sessionObj.value.$aiError = "";
    if (!sessionObj.value.sessionId) return;
    const targetSessionId = sessionObj.value.sessionId; //多次请求，只处理处理最后一次
    getAiSessionContent({ sessionId: sessionObj.value.sessionId, pageNum: contentPage.value.pageNum, pageSize: contentPage.value.pageSize })
      .then(res => {
        if (targetSessionId !== sessionObj.value.sessionId) return;
        if (res && res.code === 200) {
          let recoverStreamQMessageId = "";
          for (let i = 0; i < res.rows.length; i++) {
            let item = res.rows[i];
            if (contentList.value.findIndex(r => r.messageId === item.messageId) === -1) {
              contentList.value.unshift(item);
              //是否恢复流式输出
              if (contentPage.value.pageNum === 1 && item.runningStatus === true && i === 0) {
                recoverStreamQMessageId = item.messageId;
              }
            }
          }
          contentPage.value.total = res.total;
          //恢复流式输出
          if (recoverStreamQMessageId) {
            senderRecovery(sessionObj.value, contentList.value, recoverStreamQMessageId, refAiChatMainContent);
          }
        } else {
          contentPage.value.total = 0;
          sessionObj.value.$aiError = $t("获取AI会话内容失败") + res.msg;
        }
      })
      .catch(() => {
        if (targetSessionId !== sessionObj.value.sessionId) return;
        sessionObj.value.$aiError = $t("获取AI会话内容失败");
      });
  };

  //个人设置
  const handlePerSetting = () => {
    rePerSetting.value.callPerSetting({ groupCode: dg.value.groupCode });
  };
  //分析数据
  const handlePerHisData = () => {
    refPerHisData.value.callPerHisData();
  };
  //帮助信息
  const handleHelp = () => {
    refHelpInfo.value.callHelpInfo();
  };

  //切换模式
  const handleClickMode = mode => {
    if (mode) dg.value.chatMode = mode;
    nextTick(() => {
      refAiChatSidebarMenu.value?.triggerActiveSession(sessionObj.value.sessionId);
    });
  };
  //新建会话
  const handleSessionNew = () => {
    handleEventMenuOpen("C", {});
  };
  //菜单事件
  const handleEventMenu = obj => {
    switch (obj.fCode) {
      case "menuActive":
        getSessionContent(obj);
        break;
      case "menuEdit":
        handleEventMenuOpen("U", obj.sessionObj);
        break;
      case "menuDelete":
        handleEventMenuOpen("D", obj.sessionObj);
        break;
      case "menuTaskOpen":
      case "menuTaskClose":
        refAiChatSidebarMenuTask.value.callAiChatMenuTask("US", obj.sessionObj);
        break;
      case "sessionAdd":
        handleEventMenuAdd(obj);
        break;
      case "sessionDelete":
      case "sessionUpdate":
      case "sessionStatus":
      case "sessionRedo":
        getSession();
        break;
    }
  };
  //打开维护窗口
  const handleEventMenuOpen = (option, sObj) => {
    if (dg.value.chatMode === "chat") {
      refAiChatSidebarMenuChat.value.callAiChatMenuChat(option, sObj);
    } else {
      refAiChatSidebarMenuTask.value.callAiChatMenuTask(option, sObj);
    }
  };
  //新增窗口
  const handleEventMenuAdd = async obj => {
    await getSession(obj);
    getSessionContent(obj);
  };

  /********************************AI对话_文件处理**************************/
  //选择文件处理
  const handleSenderSelectFile = obj => {
    senderSelectFile(obj, sessionObj.value, dg.value, _aiDomObj.value.globalConfig);
  };
  //删除文件
  const handleSenderRemoveFile = file => {
    senderRemoveFile(sessionObj.value, file);
  };

  /********************************AI对话_流式内容发送**************************/
  //发送会话处理
  const handleSenderSend = obj => {
    processSend(obj);
  };
  //停止会话处理
  const handleSenderStop = () => {
    senderStop(sessionObj.value, true);
    if (contentList.value && contentList.value.length > 1) {
      let lastContent = contentList.value[contentList.value.length - 1];
      if (lastContent && lastContent.qaType === "A" && !lastContent.content) {
        lastContent.content = "";
      }
    }
  };
  //会话内容事件
  const handleEventContent = confirmObj => {
    //更新结果
    if (confirmObj.btnPage !== true) updDataJsonSt(confirmObj);
    //处理结果
    if (["skill_api_confirm"].includes(confirmObj.btnMode) || confirmObj.btnPage === true) {
      processSend(refAiChatMainSender.value.getXSenderData(), confirmObj);
    } else {
      if (confirmObj.btnMode === "collect_confirm" && _aiLay.value.collectMode === "1") {
        processDataCollect(_bsDataObj, confirmObj.dataSt.$obj, _aiDomObj.value.collectDom);
      } else if (confirmObj.btnMode === "skill_analy_send_confirm") {
        processDataAnalySend(sessionObj.value, confirmObj);
      }
      emit("aiEvent", confirmObj);
    }
  };
  //发送数据
  const processSend = async (obj, confirmObj = "") => {
    //设置为加载状态
    sessionObj.value.$senderLoading = true;
    sessionObj.value.$senderContextMsgIds = [];
    for (let key in contextSelected.value) {
      if (contextSelected.value[key]) sessionObj.value.$senderContextMsgIds.push(key);
      contextSelected.value[key] = false;
    }
    //获取功能模式
    let btnMC = getBtnModeCode(config.value, obj, confirmObj);
    //获取业务数据
    let bsDataSend = await getBsDataSend(sessionObj.value, btnMC, _bsDataObj.value, _bsPageData.value, props.callMethod);
    //发送数据
    senderSend(sessionObj.value, contentList.value, btnMC, dg.value, _aiFst.value, bsDataSend, obj, confirmObj, refAiChatMainContent);
    //跳转到底部
    refAiChatMainContent.value.scrollToBottom();
  };
</script>
