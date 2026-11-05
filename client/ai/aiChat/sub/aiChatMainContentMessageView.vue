<template>
  <el-dialog
    :title="$t('会话消息详情')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="['75%', '85%']" />

    <el-form class="app-el-form">
      <el-row>
        <szd-input-form-item-col label="会话消息ID" v-model="_messageObj.messageId" disabled :span="12" />
        <szd-input-form-item-col label="Agent消息ID" v-model="_messageObj.agentMessageId" disabled :span="12" />
        <szd-input-form-item-col label="问/答" v-model="_messageObj.qaTypeDesc" disabled :span="12" />
        <szd-date-form-item-col label="生成时间" v-model="_messageObj.createTime" type="datetime" disabled :span="12" />
        <szd-select-form-item-col label="功能按钮" v-model="_messageObj.btnCode" baseField="SKIS_AI_BTN" disabled :span="12" />
        <szd-select-form-item-col label="功能模式" v-model="_messageObj.btnMode" baseField="SKIS_AI_BTN_MODE" disabled :span="12" />
        <el-col :span="12">
          <el-form-item :label="$t('执行状态')">
            <szd-light :light="_messageObj.execLight" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="_messageObj.qaType === 'Q'">
        <szd-textarea-form-item-col label="会话内容" v-model="_messageObj.content" disabled :rows="5" :span="24" labelWidth="12.5%" />
        <szd-textarea-form-item-col label="按钮规范" v-model="_messageObj.contentBtn" disabled :rows="5" :span="24" labelWidth="12.5%" />
        <szd-textarea-form-item-col label="业务规范" v-model="_messageObj.contentHarness" disabled :rows="5" :span="24" labelWidth="12.5%" />
        <cViewHlt label="引用知识库" :code="_messageObj.kbJson" />
        <cViewHlt label="附件清单" :code="_messageObj.fileJson" />
        <cViewHlt label="页面数据" :code="_messageObj.dataJson" />
        <cViewHlt label="页面字段" :code="_messageObj.pageDomJson" />
        <cViewHlt label="技能调用参数/清单" :code="_messageObj.skillJson" />
        <cViewHlt label="技能SQL" :code="_messageObj.skillSql" />
        <cViewHlt label="技能调用结果" :code="_messageObj.skillJsonResult" />
        <cViewHlt label="全局规范" :code="_messageObj.contentCommon" />
        <cViewHlt label="会话主题规范" :code="_messageObj.contentSession" />
      </el-row>
      <el-row v-else>
        <szd-textarea-form-item-col label="AI会话内容" v-model="_messageObj.content" disabled :rows="15" :span="24" labelWidth="12.5%" />
        <cViewHlt label="AI会话结果JSON" :code="_messageObj.dataJson" />
        <cViewHlt label="技能调用参数" :code="_messageObj.skillJson" />
        <cViewHlt label="技能SQL" :code="_messageObj.skillSql" />
        <cViewHlt label="技能调用结果" :code="_messageObj.skillJsonResult" />
      </el-row>
    </el-form>

    <!-- AI相关信息 -->
    <div v-if="_messageObj.subMessageList?.length" class="l-message-sub-content">
      <div class="main-table-title">
        <div class="main-table-title-left" style="width: 50%">
          <span>{{ $t("关联AI会话") }}</span>
        </div>
      </div>
      <el-table border stripe :data="_messageObj.subMessageList" class="flex-1">
        <el-table-column prop="messageId" label="会话消息ID" width="180" />
        <el-table-column prop="createTime" label="生成时间" width="160" />
        <el-table-column prop="btnMode" label="功能模式" width="180" align="center" />
        <el-table-column prop="qaType" label="问/答" width="80" align="center">
          <template #default="scope">
            {{ scope.row.qaType === "Q" ? "Q." + $t("问") : "A." + $t("答") }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="会话内容" min-width="300" align="center">
          <template #default="scope">
            <szd-hlt-div :code="scope.row.content" :length="100" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('操作')" width="80" fixed="right" align="center">
          <template #default="scope">
            <szd-button label="详情" type="primary" link icon="View" @click="handleViewRow(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 发送会话内容 -->
    <aiChatMainContentMessageView ref="refAiChatMainContentMessageView" />
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { $t } from "../../../common/utils/globalConfig";
  import { getAiSessionMessage } from "../api/aiChat";
  import cViewHlt from "./aiChatMainContentMessageViewHlt.vue";
  import aiChatMainContentMessageView from "./aiChatMainContentMessageView.vue";

  const refAiChatMainContentMessageView = ref();

  const dg = ref({
    open: false
  });

  const _messageObj = ref({});

  //打开窗口
  const callAiContentSendAiView = infoParam => {
    dg.value.open = true;
    _messageObj.value = {};
    getAiSessionMessage(infoParam.messageId).then(res => {
      if (res.code === 200) {
        _messageObj.value = {
          messageId: res.data.messageId,
          agentMessageId: res.data.agentMessageId,
          autoTaskId: res.data.autoTaskId,
          btnMode: res.data.btnMode,
          btnCode: res.data.btnCode,
          qaType: res.data.qaType,
          qaTypeDesc: res.data.qaType === "Q" ? "Q." + $t("问") : "A." + $t("答"),
          content: res.data.content || "",
          fileJson: res.data.fileJson || "",
          dataJson: res.data.dataJson || "",
          skillJson: res.data.skillJson || "",
          skillJsonResult: res.data.skillJsonResult || "",
          skillSql: res.data.skillSql || "",
          pageDomJson: res.data.pageDomJson || "",
          contentBtn: res.data.contentBtn || "",
          contentHarness: res.data.contentHarness || "",
          kbJson: res.data.kbJson || "",
          contentSession: res.data.contentSession || "",
          contentCommon: res.data.contentCommon || "",
          execLight: res.data.execLight,
          createTime: res.data.createTime,
          subMessageList: res.data.subMessageList || []
        };
      }
    });
  };

  //详情信息
  const handleViewRow = row => {
    refAiChatMainContentMessageView.value.callAiContentSendAiView(row);
  };

  defineExpose({ callAiContentSendAiView });
</script>
<style scoped lang="scss">
  .l-message-sub-content {
    display: flex;
    flex-direction: column;
    margin-top: 5px;
  }
</style>
