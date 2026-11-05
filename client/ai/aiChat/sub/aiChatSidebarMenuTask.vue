<template>
  <el-dialog
    :title="dg.title"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="['1100', '80%']" />

    <el-form class="app-el-form" @submit.prevent>
      <el-row>
        <szd-input-form-item-col label="会话组" v-model="_taskObj.groupCode" disabled :span="12" :descSpan="12" :desc="_taskObj.groupName" />
        <szd-input-form-item-col label="用户" v-model="_taskObj.userId" disabled :span="12" :descSpan="12" :desc="_taskObj.userName" />
        <szd-input-form-item-col
          label="会话名称"
          v-model="_taskObj.title"
          required
          :disabled="_taskObj.deleFlag"
          :maxlength="50"
          :span="24"
          labelWidth="12.5%" />
      </el-row>
    </el-form>

    <el-tabs v-model="dg.actTab">
      <el-tab-pane :label="$t('任务信息')" name="TAB1">
        <aiChatSidebarMenuTaskBase :taskObj="_taskObj" :mDg="dg" @changeSkill="handleChangeSkill" />
      </el-tab-pane>
      <el-tab-pane v-if="_taskObj.taskType === 'B'" :label="$t('调用参数')" name="TAB2">
        <aiChatSidebarMenuTaskInParam
          ref="refAiChatSidebarMenuTaskInParam"
          :taskObj="_taskObj"
          :mDg="dg"
          :skillInputParamList="_skillInputParamList" />
      </el-tab-pane>
      <el-tab-pane v-if="_taskObj.taskType === 'B'" :label="$t('调用参数JSON预览')" name="view">
        <szd-hlt :code="_taskObj.skillInputParam" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <szd-button
        v-if="_taskObj.taskType === 'B' && _skillInputParamList.length === 0"
        label="格式化"
        type="primary"
        plain
        @click="handleInputParamFormat" />
      <szd-button
        v-if="_taskObj.taskType === 'B' && _skillInputParamList.length === 0"
        label="校验"
        type="primary"
        plain
        @click="handleInputParamCheck" />
      <szd-button v-if="!_taskObj.deleFlag" label="确定" type="primary" @click="saveForm" />
      <szd-button v-else label="撤回" type="primary" @click="redoForm" />
      <szd-button label="关闭" type="primary" @click="closeForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { $mE, $mNull, $mS, $t } from "../../../common/utils/globalConfig";
  import { szdPopDel } from "../../../common/message/popup";
  import { convertSkillDataParam, convertSkillDataRange } from "../js/aiChatResultSkill";
  import { isObject } from "../js/aiChatInit";
  import {
    addSessionTask,
    checkSessionTaskSkill,
    deleteSessionTask,
    getSessionTask,
    getSkillMdmApi,
    updateSessionTask,
    updateSessionTaskStatus
  } from "../api/sessionAutoTaskAuth";
  import aiChatSidebarMenuTaskBase from "./aiChatSidebarMenuTaskBase.vue";
  import aiChatSidebarMenuTaskInParam from "./aiChatSidebarMenuTaskInParam.vue";

  const emit = defineEmits(["handleEvent"]);

  const refAiChatSidebarMenuTaskInParam = ref();

  const props = defineProps({
    mDg: {
      type: Object,
      default: () => {}
    },
    aiLay: {
      type: Object,
      default: () => ({})
    },
    config: {
      type: Object,
      default: () => ({})
    }
  });

  const dg = ref({
    open: false,
    title: "",
    option: "",
    actTab: "TAB1",
    taskAuthId: ""
  });

  const _taskObj = ref({
    taskAuthId: "",
    groupCode: "", //会话组代码
    groupName: "", //会话组名称
    userId: "", //用户ID
    userName: "", //用户名称
    taskType: "", //任务分类
    btnCode: "", //功能按钮
    btnName: "",
    routerCode: "", //路由代码
    routerName: "", //路由名称
    bstp: "", //业务类型
    bstpName: "",
    nodeId: "", //节点编码
    nodeName: "", //节点名称
    skillCode: "", //技能代码
    skillName: "", //技能名称
    skillInputParam: {}, //入参
    skillInputParamStr: "",
    promptContent: "", //自动任务提示词
    taskHourSeg: ["", "", "", ""], //定时有效时间段
    taskEctTime: "", //最后执行时间
    taskStatus: false, //是否启用
    btnCodeBstp: "", //工单业务类型
    btnCodeBstpName: "",
    btnCodeCommit: false, //工单自动提交
    deleFlag: false, //删除标记
    sessionId: "", //会话ID
    title: "", //会话名称
    sessionHarness: "", //会话主题规范
    contextTurns: 0 //上下文引用轮次
  });

  const _skillInputParamList = ref([]);

  //打开窗口
  const callAiChatMenuTask = (option, taskObj) => {
    dg.value.title = option === "C" ? $t("创建会话") : $t("编辑会话");
    dg.value.option = option;
    dg.value.actTab = "TAB1";
    dg.value.taskAuthId = taskObj.taskAuthId || "";
    _skillInputParamList.value = [];
    if (option === "C") {
      initDataCtr();
    } else if (option === "U") {
      initDataUpd();
    } else if (option === "US") {
      updateTaskStatus(taskObj);
    } else if (option === "D") {
      deleteTask(taskObj);
    }
  };

  //初始化-创建会话
  const initDataCtr = () => {
    if ((props.aiLay.bstp && !props.aiLay.nodeId) || (!props.aiLay.bstp && props.aiLay.nodeId)) {
      return $mE("审批单据只有在审批节点时才可设置任务");
    }
    _taskObj.value = {
      taskAuthId: "",
      groupCode: props.mDg.groupCode,
      groupName: props.mDg.groupName,
      userId: props.mDg.userId,
      userName: props.mDg.userName,
      taskType: props.aiLay.bstp || props.aiLay.nodeId ? "A" : "B", //任务分类
      btnCode: "",
      btnName: "",
      routerCode: props.aiLay.routerCode || "",
      bstp: props.aiLay.bstp || "",
      bstpName: props.aiLay.bstpName || "",
      nodeId: props.aiLay.nodeId || "",
      nodeName: props.aiLay.nodeName || "",
      skillCode: "",
      skillName: "",
      skillInputParam: {},
      skillInputParamStr: "",
      promptContent: "", //自动任务提示词
      taskHourSeg: ["", "", "", ""],
      taskEctTime: "",
      taskStatus: false, //是否启用
      btnCodeBstp: "", //工单业务类型
      btnCodeBstpName: "",
      btnCodeCommit: false, //工单自动提交
      deleFlag: false, //删除标记
      sessionId: "", //会话ID
      title: "", //会话名称
      sessionHarness: "", //会话主题规范
      contextTurns: 0 //上下文引用轮次
    };
    const btnItem = props.config.btnList.find(r => r.btnMode === (_taskObj.value.taskType === "A" ? "approve" : "analy_send"));
    if (btnItem) {
      _taskObj.value.btnCode = btnItem.btnCode;
      _taskObj.value.btnName = btnItem.btnName;
    }
    dg.value.open = true;
  };

  //初始化-查询
  const initDataUpd = async () => {
    _taskObj.value = { taskHourSeg: ["", "", "", ""] };
    const res = await getSessionTask(dg.value.taskAuthId);
    if (res.code !== 200) return;
    _taskObj.value = res.data;
    //获取技能参数
    await getSkillInfo();
    dg.value.open = true;
  };

  //获取技能信息
  const getSkillInfo = async () => {
    setSkillInputParamStr();
    _skillInputParamList.value = [];
    if (!_taskObj.value.skillCode) return;

    const resSkill = await getSkillMdmApi(_taskObj.value.skillCode);
    if (resSkill.code !== 200 || !resSkill.data.inputParamList || resSkill.data.inputParamList.length === 0) return;
    _skillInputParamList.value = resSkill.data.inputParamList;

    if (!isObject(_taskObj.value.skillInputParam)) _taskObj.value.skillInputParam = {};

    let _inParam = {};
    for (let i = 0; i < _skillInputParamList.value.length; i++) {
      let inputParam = _skillInputParamList.value[i];
      if (inputParam.fieldRange) {
        if (!isObject(_inParam.ranges)) _inParam.ranges = {};
        if (isObject(_taskObj.value.skillInputParam.ranges)) {
          _inParam.ranges[inputParam.fieldCode] = _taskObj.value.skillInputParam.ranges[inputParam.fieldCode];
        }
        convertSkillDataRange(inputParam, _inParam.ranges);
      } else {
        _inParam[inputParam.fieldCode] = _taskObj.value.skillInputParam[inputParam.fieldCode];
        convertSkillDataParam(inputParam, _inParam, inputParam.fieldCode);
      }
    }
    _taskObj.value.skillInputParam = _inParam;
    setSkillInputParamStr();
  };

  //获取输入参数维护
  const setSkillInputParamStr = () => {
    _taskObj.value.skillInputParamStr = "";
    if (_taskObj.value.skillInputParam && typeof _taskObj.value.skillInputParam === "object") {
      _taskObj.value.skillInputParamStr = JSON.stringify(_taskObj.value.skillInputParam, null, 2);
    } else if (_taskObj.value.skillInputParam) {
      _taskObj.value.skillInputParamStr = String(_taskObj.value.skillInputParam);
    }
  };

  //启用/关闭任务
  const updateTaskStatus = taskObj => {
    taskObj.taskStatus = !taskObj.taskStatus;
    updateSessionTaskStatus({ taskAuthId: taskObj.taskAuthId, taskStatus: taskObj.taskStatus }).then(res => {
      if (res.code === 200) {
        emit("handleEvent", { fCode: "sessionStatus", sessionObj: taskObj });
        $mS("操作成功");
      }
    });
  };

  //删除-任务
  const deleteTask = taskObj => {
    szdPopDel().then(() => {
      taskObj.deleFlag = true;
      deleteSessionTask({ taskAuthId: taskObj.taskAuthId, deleFlag: taskObj.deleFlag }).then(res => {
        if (res.code === 200) {
          emit("handleEvent", { fCode: "sessionDelete", sessionObj: taskObj });
          $mS("删除成功");
        }
      });
    });
  };

  //保存数据
  const saveForm = () => {
    if (saveFormCheck() !== true) return;
    if (dg.value.option === "C") {
      _taskObj.value.groupCode = props.mDg.groupCode;
      _taskObj.value.userId = props.mDg.userId;
      _taskObj.value.deleFlag = false;
      addSessionTask(_taskObj.value).then(res => {
        if (res.code === 200) {
          _taskObj.value.sessionId = res.data.sessionId;
          emit("handleEvent", { fCode: "sessionAdd", sessionObj: _taskObj.value });
          $mS("保存成功");
          dg.value.open = false;
        }
      });
    } else {
      updateSessionTask(_taskObj.value).then(res => {
        if (res.code === 200) {
          emit("handleEvent", { fCode: "sessionUpdate", sessionObj: _taskObj.value });
          $mS("保存成功");
          dg.value.open = false;
        }
      });
    }
  };

  //检查数据
  const saveFormCheck = () => {
    if ($mNull(_taskObj.value.title, "会话名称不能为空")) return false;
    if ($mNull(_taskObj.value.btnCode, "功能按钮不能为空")) return false;
    if ($mNull(_taskObj.value.promptContent, "自动任务提示词不能为空")) return false;
    if (_taskObj.value.taskType === "B") {
      if ($mNull(_taskObj.value.btnCodeBstp, "工单业务类型不能为空")) return false;
      if ($mNull(_taskObj.value.skillCode, "Skill代码不能为空")) return false;
      if ($mNull(_taskObj.value.skillInputParam, "Skill调用参数不能为空")) return false;
      if (typeof _taskObj.value.skillInputParam !== "object") {
        $mE("JSON格式错误【键名无引号】或【格式不完整】");
        return false;
      }
    }
    const hour = _taskObj.value.taskHourSeg;
    if (!hour[0]) {
      return $mE("自动任务时间第1个必须维护");
    }
    if (hour[1] && Number(hour[1]) <= Number(hour[0])) {
      return $mE("自动任务时间第2个时间如果维护必须大于第1个时间");
    }
    if (hour[2] && (!hour[1] || Number(hour[2]) <= Number(hour[1]))) {
      return $mE("自动任务时间第3个时间如果维护必须大于第2个时间");
    }
    if (hour[3] && (!hour[1] || !hour[2] || Number(hour[3]) <= Number(hour[2]))) {
      return $mE("自动任务时间第4个时间如果维护必须大于第3个时间");
    }
    return true;
  };

  //撤回删除
  const redoForm = () => {
    _taskObj.value.deleFlag = false;
    checkSessionTaskSkill(_taskObj.value.taskAuthId, _taskObj.value.skillCode);
    deleteSessionTask({ taskAuthId: _taskObj.value.taskAuthId, deleFlag: _taskObj.value.deleFlag }).then(res => {
      if (res.code === 200) {
        emit("handleEvent", { fCode: "sessionRedo", sessionObj: _taskObj.value });
        $mS("撤回成功");
        dg.value.open = false;
      }
    });
  };

  //技能
  const handleChangeSkill = () => {
    getSkillInfo();
  };

  //格式化
  const handleInputParamFormat = () => {
    refAiChatSidebarMenuTaskInParam.value.inputParamFormat();
  };

  //检查Json
  const handleInputParamCheck = () => {
    refAiChatSidebarMenuTaskInParam.value.inputParamCheck();
  };

  //关闭窗口
  const closeForm = () => {
    dg.value.open = false;
  };

  defineExpose({ callAiChatMenuTask });
</script>
