<template>
  <el-dialog
    :title="$t('分析结果')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="['75%', '85%']" />
    <el-form class="app-el-form" @submit.prevent>
      <el-row>
        <szd-input-form-item-col
          label="用户"
          v-model="rowObj.userId"
          showHelp
          :help="{ a: 'CORE_USER', b: rowObj, c: ['userId', 'userName'] }"
          format="upper"
          :disabled="viewChat"
          clearable
          required
          :span="12"
          :descSpan="12"
          :desc="rowObj.userName"
          :szdopt="szdopt" />
        <szd-input-form-item-col
          label="业务类型"
          v-model="rowObj.bstp"
          showHelp
          :help="{ a: 'CORE_BSTP', b: rowObj, c: ['bstp', 'bstpName'], d: [['routerCode', 'SKIS_AI_20A']] }"
          format="upper"
          :disabled="viewChat"
          clearable
          required
          :span="12"
          :descSpan="12"
          :desc="rowObj.bstpName"
          :szdopt="szdopt" />
        <szd-select-form-item-col
          label="结论"
          v-model="rowObj.conclusion"
          baseField="SKIS_AI_CONCL_ANALY"
          :disabled="viewChat"
          required
          :span="12"
          :szdopt="szdopt" />
        <szd-input-form-item-col label="工单唯一值" v-model="rowObj.workOrderUniqKey" :disabled="viewChat" clearable :span="12" :szdopt="szdopt" />
      </el-row>
      <el-row>
        <szd-textarea-form-item-col
          label="结论批注"
          v-model="rowObj.comment"
          :disabled="viewChat"
          :maxlength="500"
          :rows="5"
          :span="24"
          :szdopt="szdopt"
          labelWidth="12.5%" />
      </el-row>
    </el-form>
    <!-- AI分析结果 -->
    <el-row>
      <el-col :span="24">
        <div class="analy-result-wrapper">
          <div class="analy-result-header">
            <span class="analy-result-header-icon"></span>
            <span class="analy-result-header-text">{{ $t("AI分析结果") }}</span>
            <div v-if="!viewChat" class="analy-result-header-actions">
              <szd-button v-if="!dg.analyEdit" label="编辑" type="primary" link size="small" icon="Edit" @click="dg.analyEdit = true" />
              <szd-button v-else-if="dg.analyEdit" label="预览" type="primary" link size="small" icon="View" @click="dg.analyEdit = false" />
            </div>
          </div>
          <div class="analy-result-content">
            <szd-textarea v-if="dg.analyEdit" v-model="rowObj.analyResult" :maxlength="200000" :rows="20" class="analy-result-textarea" />
            <aiChatMainContentMarkdown v-else :content="rowObj.analyResult" />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 已生成工单清单 -->
    <el-row v-if="rowObj.wfBussIds && rowObj.wfBussIds.length > 0">
      <el-col :span="24">
        <div class="analy-result-wrapper">
          <div class="analy-result-header">
            <span class="analy-result-header-icon"></span>
            <span class="analy-result-header-text">{{ $t("已生成工单清单") }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="24">
        <el-table :data="rowObj.wfBussIds" border style="width: 100%">
          <el-table-column prop="bussId" label="工单单号" min-width="180" align="center">
            <template #default="scope">
              {{ scope.row.bussDocId || scope.row.bussId }}
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="用户" width="140" align="center" />
          <el-table-column prop="bussDate" label="业务日期" width="130" align="center" />
          <el-table-column prop="bussName" label="业务类型" min-width="180" align="center" />
          <el-table-column prop="bussStatusName" label="单据状态" min-width="180" align="center" />
          <el-table-column label="操作" width="80" align="center" fixed="right">
            <template #default="scope">
              <szd-button label="查看" type="primary" link @click="handleClickGoNav(scope.row)" />
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <template #footer>
      <szd-button v-if="dg.index > 0" label="上一条" type="primary" @click="handleNext(-1)" />
      <szd-button v-if="dg.index < props.aiDataList.length - 1" label="下一条" type="primary" @click="handleNext(1)" />
      <szd-button
        v-if="!viewChat"
        :label="rowObj.wfBussIds && rowObj.wfBussIds.length > 0 ? '再次推送提交' : '推送提交'"
        type="primary"
        @click="handleClickSent('C')" />
      <szd-button
        v-if="!viewChat"
        :label="rowObj.wfBussIds && rowObj.wfBussIds.length > 0 ? '再次推送制单' : '推送制单'"
        type="primary"
        @click="handleClickSent('A')" />
      <szd-button label="关闭" type="primary" @click="dg.open = false" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { $mE, $mNull, $t } from "../../../common/utils/globalConfig";
  import szdRouter from "../../../common/utils/goRouter";
  import aiChatMainContentMarkdown from "../sub/aiChatMainContentMarkdown.vue";

  const emit = defineEmits(["sentAnalyData"]);

  const props = defineProps({
    aiDataList: {
      type: Array,
      default: () => []
    },
    szdopt: {
      type: String
    },
    viewChat: {
      type: Boolean
    }
  });

  //功能参数
  const dg = ref({
    open: false,
    analyEdit: false,
    index: 0
  });

  //结果详情
  const rowObj = ref({});
  //编辑消息
  const callAiChatMainContentDataAnalySendDg = (row, index) => {
    rowObj.value = row;
    dg.value.index = index;
    dg.value.open = true;
    dg.value.analyEdit = false;
  };

  //下一行工单
  const handleNext = next => {
    if (props.aiDataList.length === 0) return;
    dg.value.index = dg.value.index + next;
    if (dg.value.index >= props.aiDataList.length) dg.value.index = props.aiDataList.length - 1;
    if (dg.value.index < 0) dg.value.index = 0;
    rowObj.value = props.aiDataList[dg.value.index];
  };

  //推送工单
  const handleClickSent = status => {
    if ($mNull(rowObj.value.userId, "用户不能为空")) return;
    if ($mNull(rowObj.value.conclusion, "分析结论不能为空")) return;
    if (!rowObj.value.comment || !rowObj.value.analyResult) {
      return $mE("结论批注和分析结果至少维护其中之一");
    }
    emit("sentAnalyData", [rowObj.value], status);
  };

  //跳转工单
  const handleClickGoNav = wfItem => {
    szdRouter.goNav("SKIS_AI_20A", { bussId: wfItem.bussId, option: "U" }, { blank: true });
  };

  defineExpose({ callAiChatMainContentDataAnalySendDg });
</script>

<style lang="scss" scoped>
  .analy-result-wrapper {
    padding-top: 6px;
  }
  .analy-result-header {
    display: flex;
    align-items: center;
    padding: 5px 0;
  }
  .analy-result-header-icon {
    width: 4px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(180deg, #667eea, #764ba2);
    margin-right: 8px;
    flex-shrink: 0;
  }
  .analy-result-header-text {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
  .analy-result-header-actions {
    margin-left: auto;
  }
  .analy-result-content {
    background: linear-gradient(135deg, #f8f9fe 0%, #f5f7fa 100%);
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 10px 10px;
    min-height: 80px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.2s ease;
  }
  .analy-result-textarea {
    width: 100%;
    :deep(.el-textarea__inner) {
      border: none;
      box-shadow: none;
      resize: vertical;
      font-family: "Menlo", "Monaco", "Courier New", monospace;
      font-size: 13px;
      line-height: 1.6;
    }
  }
</style>
