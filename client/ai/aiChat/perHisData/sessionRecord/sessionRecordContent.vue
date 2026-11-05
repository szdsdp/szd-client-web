<template>
  <el-dialog
    :title="$t('会话详情')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="['85%', '70%']" />
    <!-- 会话内容 -->
    <div class="szd-ai-chat__main hp100">
      <aiChatMainContent
        :sessionObj="sessionObj"
        :contentList="contentList"
        :contentPage="contentPage"
        :contentDataSt="contentDataSt"
        :aiDomObj="_aiDomObj"
        szdopt="V"
        viewChat
        @handleEvent="handleEventContent"
        @refresh="getSessionContent" />
    </div>
  </el-dialog>
</template>

<script setup>
  import "../../css/index.scss";
  import { ref } from "vue";
  import { $t } from "../../../../common/utils/globalConfig";
  import { getAiSessionContent } from "../../api/aiChat";
  import aiChatMainContent from "../../sub/aiChatMainContent.vue";
  //功能参数
  const dg = ref({ open: false, sessionId: "", autoTaskId: "", mode: "" });
  //激活会话
  const sessionObj = ref({});
  //会话内容
  const contentList = ref([]);
  const contentDataSt = ref({});
  //会话内容分页
  const contentPage = ref({ pageNum: 1, pageSize: 50, total: 0 });
  //程序内部使用的DOM和全局配置
  const _aiDomObj = ref({ collectDom: [], globalConfig: [] });
  //打开窗口
  const callSessionRecordContent = (mode, infoParam) => {
    dg.value.sessionId = infoParam.sessionId;
    dg.value.autoTaskId = mode === "task" ? infoParam.autoTaskId : "";
    dg.value.mode = mode;
    dg.value.open = true;
    sessionObj.value = infoParam;
    contentList.value = [];
    getSessionContent();
  };
  //获取会话内容
  const getSessionContent = obj => {
    if (obj) {
      contentPage.value.pageNum = 1;
      contentList.value = [];
    }
    let json = {
      sessionId: dg.value.sessionId,
      autoTaskId: dg.value.autoTaskId,
      pageNum: contentPage.value.pageNum,
      pageSize: contentPage.value.pageSize
    };
    getAiSessionContent(json).then(res => {
      if (res && res.code === 200) {
        for (let i = 0; i < res.rows.length; i++) {
          let item = res.rows[i];
          if (contentList.value.findIndex(r => r.messageId === item.messageId) === -1) {
            contentList.value.unshift(item);
          }
        }
        contentPage.value.total = res.total;
      } else {
        contentPage.value.total = 0;
      }
    });
  };
  //会话内容事件
  const handleEventContent = confirmObj => {};

  defineExpose({ callSessionRecordContent });
</script>
