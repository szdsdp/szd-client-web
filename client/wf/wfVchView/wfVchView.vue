<template>
  <!-- 凭证预览 -->
  <el-dialog
    :title="$t('凭证预览')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
    class="app-dialog-container"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="['80%', 600]" />
    <!-- 凭证抬头 -->
    <el-form class="app-el-form" style="margin-bottom: 5px">
      <el-row>
        <szd-input-form-item-col label="业务单号" v-model="_vchParam.header.bussDocId" disabled :span="12" />
        <szd-input-form-item-col
          label="公司代码"
          v-model="_vchParam.header.cmpy"
          disabled
          :span="12"
          :descSpan="12"
          :desc="_vchParam.header.cmpyName" />
        <szd-input-form-item-col
          label="凭证类型"
          v-model="_vchParam.header.vchType"
          disabled
          :span="12"
          :descSpan="12"
          :desc="_vchParam.header.vchTypeName" />
        <szd-input-form-item-col label="年度" v-model="_vchParam.header.vchYear" disabled :span="12" />
        <szd-input-form-item-col label="期间" v-model="_vchParam.header.vchMonth" disabled :span="12" />
        <szd-date-form-item-col label="凭证日期" v-model="_vchParam.header.vchDate" disabled :span="12" />
        <szd-date-form-item-col label="过账日期" v-model="_vchParam.header.postDate" disabled :span="12" />
        <szd-input-form-item-col label="抬头文本" v-model="_vchParam.header.headText" disabled :span="12" />
        <szd-input-form-item-col label="币种" v-model="_vchParam.header.curr" disabled :span="12" />
        <szd-input-form-item-col label="参考码1" v-model="_vchParam.header.headRef01" disabled :span="12" />
        <szd-input-form-item-col label="参考码2" v-model="_vchParam.header.headRef02" disabled :span="12" />
      </el-row>
    </el-form>
    <!-- 凭证分录 -->
    <szd-table :layout="lay.layout" :fieldCat="lay.fieldCat" v-model:data="_vchParam.itemList" border stripe />

    <template #footer>
      <szd-button label="检查" type="primary" @click="checkForm" />
      <szd-button label="取消" type="primary" @click="closeForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref, onMounted, computed } from "vue";
  import { $t } from "../../common/utils/globalConfig";
  import { szdMsgBox } from "../../components/msgBox/msgBox";
  import { vchCheck } from "../api/wfApi";

  //定义事件
  const emit = defineEmits(["closeForm"]);

  const props = defineProps({
    vchParam: {
      type: Object
    }
  });

  //功能参数
  const dg = ref({
    open: false
  });

  const _vchParam = computed(() => {
    return props.vchParam ? props.vchParam : { header: {}, itemList: [] };
  });

  //凭证分录
  const lay = ref({
    layout: { report: "CORE_WF_VCH", pagination: "0", viewMode: "1", viewTitle: "vchItem" },
    fieldCat: [
      { field: "vchItem", label: "行项目", minWidth: 80, align: "center" },
      { field: "drCr", label: "借/贷", minWidth: 80 },
      { field: "accs", label: "会计科目", minWidth: 100 },
      { field: "accsName", label: "会计科目名称", minWidth: 300 },
      { field: "vchAmt", label: "凭证金额", type: "number", numDec: 2, minWidth: 120 },
      { field: "assignNo", label: "分配号", minWidth: 150 },
      { field: "summary", label: "项目文本", minWidth: 250 },
      { field: "supp", label: "供应商", minWidth: 100 },
      { field: "cust", label: "客户", minWidth: 100 },
      { field: "sgl", label: "特别总账标识", minWidth: 120 },
      { field: "busc", label: "业务范围", minWidth: 100 },
      { field: "prfc", label: "利润中心", minWidth: 100 },
      { field: "cstc", label: "成本中心", minWidth: 100 },
      { field: "segm", label: "段", minWidth: 100 },
      { field: "reas", label: "原因代码", minWidth: 100 },
      { field: "transType", label: "事务类型", minWidth: 100 },
      { field: "fusc", label: "功能范围", minWidth: 100 },
      { field: "accType", label: "科目类型", minWidth: 100 },
      { field: "orderCode", label: "内部订单", minWidth: 100 },
      { field: "poDoc", label: "采购凭证", minWidth: 100 },
      { field: "poDocItem", label: "采购凭证项目", minWidth: 150 },
      { field: "assetNo", label: "固定资产", minWidth: 100 },
      { field: "assetNoSub", label: "资产次级编号", minWidth: 150 },
      { field: "payTermCode", label: "收付条件", minWidth: 100 },
      { field: "baseDate", label: "基准日期", minWidth: 100 },
      { field: "days", label: "天数", minWidth: 100 },
      { field: "taxRate", label: "税码", minWidth: 100 },
      { field: "cmpyPartner", label: "贸易伙伴", minWidth: 100 },
      { field: "ref01", label: "参考码1", minWidth: 100 },
      { field: "ref02", label: "参考码2", minWidth: 100 },
      { field: "ref03", label: "参考码3", minWidth: 100 }
    ]
  });

  onMounted(() => {
    initData();
  });

  //初始化数据
  const initData = () => {
    dg.value.open = true;
  };

  //调用凭证检查
  const checkForm = () => {
    vchCheck(_vchParam.value).then(res => {
      if (res.code === 200) {
        szdMsgBox(res.data);
      }
    });
  };

  const closeForm = () => {
    dg.value.open = false;
  };

  //取消
  const handleClose = () => {
    emit("closeForm");
  };
</script>
