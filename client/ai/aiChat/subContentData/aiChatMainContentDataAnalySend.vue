<template>
  <section v-if="aiDataObj" class="szd-ai-chat__data">
    <!-- 标题 -->
    <div class="data__header">
      <span>{{ $t("AI数据分析推送") }}</span>
      <el-radio-group v-model="dg.rad" size="small">
        <el-radio-button :label="$t('表格')" value="rad1" />
        <el-radio-button label="Json" value="rad2" />
      </el-radio-group>
    </div>
    <!-- 显示数据 -->
    <div class="data__show">
      <div v-show="dg.rad === 'rad1'" class="show-table">
        <!-- 功能按钮 -->
        <div v-if="isConfirm" class="main-table-title">
          <div class="main-table-title-left" style="width: 50%"></div>
          <div class="main-table-title-right" style="width: 50%">
            <szd-button v-if="!viewChat" label="推送提交" type="primary" link icon="Position" @click="handleClickSent('C')" />
            <szd-button v-if="!viewChat" label="推送制单" type="primary" link icon="Position" @click="handleClickSent('A')" />
          </div>
        </div>
        <!-- 推送清单 -->
        <el-table v-if="isConfirm" border stripe :data="aiDataObj.dataSt.$obj" @selection-change="handleSelRow" :max-height="500">
          <el-table-column align="center" type="selection" width="40" />
          <el-table-column prop="userId" align="center" min-width="400">
            <template #header>
              <szd-table-col-header label="基本信息" required />
            </template>
            <template v-slot="scope">
              <el-row>
                <szd-input-form-item-col
                  label="用户"
                  v-model="scope.row.userId"
                  showHelp
                  :help="{ a: 'CORE_USER', b: scope.row, c: ['userId', 'userName'] }"
                  format="upper"
                  clearable
                  :span="24"
                  :descSpan="12"
                  :desc="scope.row.userName"
                  :szdopt="szdopt" />
                <szd-select-form-item-col label="结论" v-model="scope.row.conclusion" baseField="SKIS_AI_CONCL_ANALY" :span="24" :szdopt="szdopt" />
                <szd-input-form-item-col
                  label="业务类型"
                  v-model="scope.row.bstp"
                  showHelp
                  :help="{ a: 'CORE_BSTP', b: scope.row, c: ['bstp', 'bstpName'], d: [['routerCode', 'SKIS_AI_20A']] }"
                  format="upper"
                  clearable
                  :span="24"
                  :descSpan="12"
                  :desc="scope.row.bstpName"
                  :szdopt="szdopt" />
                <el-col v-if="scope.row.wfBussIds && scope.row.wfBussIds.length > 0" :span="24">
                  <el-form-item :label="$t('AI工单')">
                    <div v-for="wfItem in scope.row.wfBussIds" class="link-type" style="padding-right: 5px" @click="handleClickGoNav(wfItem)">
                      {{ wfItem.bussDocId || wfItem.bussId }}
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column prop="comment" align="center" min-width="350">
            <template #header>
              <szd-table-col-header label="结论批注" />
            </template>
            <template v-slot="scope">
              <szd-textarea v-model="scope.row.comment" :maxlength="500" :rows="5" clearable :szdopt="szdopt" />
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column :label="$t('结果')" width="80" fixed="right" align="center">
            <template #default="scope">
              <szd-button label="详情" type="primary" link icon="Edit" @click="handleAnalyOpen(scope.row, scope.$index)" />
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="show-no-rule">
          <div class="no-rule__header">
            <el-icon :size="18"><WarningFilled /></el-icon>
            <span>{{ $t("未分析到可推送的数据") }}</span>
          </div>
          <ul class="no-rule__list">
            <li>{{ $t("提示词内容不准确") }}</li>
            <li>{{ $t("提供的数据不准确") }}</li>
          </ul>
        </div>
      </div>
      <div v-show="dg.rad === 'rad2'" class="show-hlt">
        <szd-hlt :code="aiDataObj.dataJs" />
      </div>
    </div>

    <aiChatMainContentDataAnalySendDg
      ref="refAiChatMainContentDataAnalySendDg"
      :aiDataList="aiDataObj.dataSt.$obj"
      :szdopt="szdopt"
      :viewChat="viewChat"
      @sentAnalyData="sentAnalyData" />
  </section>
</template>

<script setup>
  import { computed, ref } from "vue";
  import { $mE, $mNull, $mW, $t } from "../../../common/utils/globalConfig";
  import szdRouter from "../../../common/utils/goRouter";
  import { convertAnalySendData, getAnalySendToDo } from "../js/aiChatResultAnalySend";
  import aiChatMainContentDataAnalySendDg from "./aiChatMainContentDataAnalySendDg.vue";

  const emit = defineEmits(["handleConfirm"]);

  const refAiChatMainContentDataAnalySendDg = ref();

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
  const listSel = ref([]);

  //AI处理数据
  const aiDataObj = computed(() => {
    if (props.messageObj.messageId && !props.contentDataSt[props.messageObj.messageId]) {
      if (props.messageObj.dataJsonSt && props.messageObj.dataJsonSt.$obj) {
        props.contentDataSt[props.messageObj.messageId] = props.messageObj.dataJsonSt;
      } else {
        props.contentDataSt[props.messageObj.messageId] = {
          $obj: convertAnalySendData(props.messageObj.dataJson),
          $opt: {}
        };
      }
      let _dataSt = props.contentDataSt[props.messageObj.messageId];
      if (_dataSt?.$obj?.length > 0) getAnalySendToDo(_dataSt.$obj);
    }
    return {
      dataJs: props.messageObj.dataJson,
      dataSt: props.messageObj.messageId ? props.contentDataSt[props.messageObj.messageId] : ""
    };
  });

  //是否可确认
  const isConfirm = computed(() => {
    if (aiDataObj.value.dataSt?.$obj?.length > 0) return true;
    return false;
  });

  const handleSelRow = selection => {
    listSel.value = selection;
  };

  //推送工单
  const handleClickSent = status => {
    if (listSel.value.length === 0) {
      return $mW("请至少选择一行需要处理的数据");
    }
    //检查数据
    for (let i = 0; i < listSel.value.length; i++) {
      if ($mNull(listSel.value[i].userId, "用户不能为空")) return;
      if ($mNull(listSel.value[i].conclusion, "分析结论不能为空")) return;
      if (!listSel.value[i].comment || !listSel.value[i].analyResult) {
        return $mE("结论批注和分析结果至少维护其中之一");
      }
    }
    sentAnalyData(listSel.value, status);
  };

  //推送工单
  const sentAnalyData = (analyList, status) => {
    emit("handleConfirm", {
      msgObj: props.messageObj,
      btnMode: "skill_analy_send_confirm",
      btnCode: "skill_analy_send_confirm" + "_" + status,
      closeAi: false,
      dataJs: aiDataObj.value.dataJs,
      dataSt: aiDataObj.value.dataSt,
      analyList: analyList
    });
  };

  //编辑消息
  const handleAnalyOpen = (row, index) => {
    refAiChatMainContentDataAnalySendDg.value.callAiChatMainContentDataAnalySendDg(row, index);
  };

  //跳转工单
  const handleClickGoNav = wfItem => {
    szdRouter.goNav("SKIS_AI_20A", { bussId: wfItem.bussId, option: "U" }, { blank: true });
  };
</script>
