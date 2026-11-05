<template>
  <section v-if="aiDataObj" class="szd-ai-chat__data">
    <!-- 标题 -->
    <div class="data__header">
      <span>{{ $t("AI智能审批") }}</span>
      <el-radio-group v-model="dg.rad" size="small">
        <el-radio-button :label="$t('表格')" value="rad1" />
        <el-radio-button label="Json" value="rad2" />
      </el-radio-group>
    </div>
    <!-- 显示数据 -->
    <div class="data__show">
      <div v-show="dg.rad === 'rad1'" class="show-table">
        <!-- 审批结果 -->
        <el-form v-if="isConfirm" class="app-el-form">
          <el-row>
            <szd-input-form-item-col
              label="审批结果"
              v-model="aiDataObj.dataSt.$obj.conclusion"
              disabled
              :span="24"
              :desc="aiDataObj.dataSt.$obj.conclusionDesc"
              :descSpan="12" />
            <szd-textarea-form-item-col
              label="审批意见"
              v-model="aiDataObj.dataSt.$obj.reason"
              :span="24"
              :rows="5"
              :maxlength="150"
              :szdopt="szdopt" />
            <el-col v-if="aiDataObj.dataSt.$obj.aiBsObj" :span="24">
              <el-form-item :label="$t('业务数据')">
                <szd-hlt-div :code="aiDataObj.dataSt.$obj.aiBsObj" :length="25" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div v-else class="show-no-rule">
          <div class="no-rule__header">
            <el-icon :size="18"><WarningFilled /></el-icon>
            <span>{{ $t("未获取审批结果原因") }}</span>
          </div>
          <ul class="no-rule__list">
            <li>{{ $t("提示词内容不准确") }}</li>
            <li>{{ $t("未推送页面数据给AI") }}</li>
          </ul>
        </div>
      </div>
      <div v-show="dg.rad === 'rad2'" class="show-hlt">
        <szd-hlt :code="aiDataObj.dataJs" />
      </div>
    </div>
    <!-- 业务处理 -->
    <div v-if="!viewChat && bsDataObj" class="data__btn">
      <el-button
        v-if="!aiLay.wf.hide_btn_approve"
        type="primary"
        size="small"
        :disabled="!isConfirm || szdopt === 'V'"
        @click="handleConfirm('btn_approve')">
        {{ aiDataObj.dataSt?.$opt ? $t("再次") : "" }}{{ $t("同意") }}
      </el-button>
      <el-button
        v-if="!aiLay.wf.hide_btn_reject"
        type="primary"
        size="small"
        :disabled="!isConfirm || szdopt === 'V'"
        @click="handleConfirm('btn_reject')">
        {{ aiDataObj.dataSt?.$opt ? $t("再次") : "" }}{{ $t("驳回") }}
      </el-button>
      <el-button
        v-if="
          (!aiLay.wf.hide_btn_approve && 'approve' === aiDataObj.dataSt?.$obj?.conclusion) ||
          (!aiLay.wf.hide_btn_reject && 'reject' === aiDataObj.dataSt?.$obj?.conclusion)
        "
        type="primary"
        size="small"
        :disabled="!isConfirm || szdopt === 'V' || !['approve', 'reject'].includes(aiDataObj.dataSt?.$obj?.conclusion)"
        @click="handleConfirm('approve_confirm')">
        {{ aiDataObj.dataSt?.$opt ? $t("再次") : "" }}{{ $t("直接确认") }}
      </el-button>
    </div>
  </section>
</template>

<script setup>
  import { computed, ref } from "vue";
  import { $t } from "../../../common/utils/globalConfig";
  import { convertApproveData } from "../js/aiChatResultApprove";

  const emit = defineEmits(["handleConfirm"]);

  const props = defineProps({
    messageObj: {
      type: Object,
      default: () => ({})
    },
    contentDataSt: {
      type: Object
    },
    aiDomObj: {
      type: Object,
      default: () => ({})
    },
    bsDataObj: {
      type: [Object, Array]
    },
    aiLay: {
      type: Object
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
    rad: "rad1"
  });

  //AI处理数据
  const aiDataObj = computed(() => {
    if (props.messageObj.messageId && !props.contentDataSt[props.messageObj.messageId]) {
      if (props.messageObj.dataJsonSt && props.messageObj.dataJsonSt.$obj) {
        props.contentDataSt[props.messageObj.messageId] = props.messageObj.dataJsonSt;
      } else {
        props.contentDataSt[props.messageObj.messageId] = {
          $obj: convertApproveData(props.messageObj.dataJson),
          $opt: false
        };
      }
    }
    return {
      dataJs: props.messageObj.dataJson,
      dataSt: props.messageObj.messageId ? props.contentDataSt[props.messageObj.messageId] : ""
    };
  });

  //是否可确认
  const isConfirm = computed(() => {
    if (aiDataObj.value.dataSt?.$obj?.conclusion) return true;
    return false;
  });

  const handleConfirm = btnCode => {
    let aiWfEvt = {
      operate: btnCode,
      comments: aiDataObj.value.dataSt.$obj.reason || "",
      aiBsObj: aiDataObj.value.dataSt.$obj.aiBsObj
    };
    if (btnCode === "approve_confirm") {
      aiWfEvt.operate = "";
      if (aiDataObj.value.dataSt.$obj.conclusion === "approve") aiWfEvt.operate = "btn_approve";
      if (aiDataObj.value.dataSt.$obj.conclusion === "reject") aiWfEvt.operate = "btn_reject";
    }
    if (aiWfEvt.operate) {
      aiDataObj.value.dataSt.$opt = true;
      emit("handleConfirm", {
        msgObj: props.messageObj,
        btnMode: "approve_confirm",
        btnCode: btnCode,
        closeAi: true,
        dataJs: aiDataObj.value.dataJs,
        dataSt: aiDataObj.value.dataSt,
        aiWfEvt: aiWfEvt
      });
    }
  };
</script>
