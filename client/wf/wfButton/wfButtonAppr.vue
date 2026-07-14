<template>
  <!-- 同意、后加签、驳回、作废页面 -->
  <el-dialog
    :title="$t(dg.title)"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="[600, 410]" />
    <el-form class="app-el-form">
      <el-row>
        <szd-textarea-form-item-col label="审批意见" v-model="form.comments" :maxlength="150" :rows="5" show-word-limit :span="24" required />
        <szd-select-form-item-col
          label="常用语"
          v-model="form.dailyItem"
          baseField="CORE_WF_DALY"
          @change="changeComments"
          :span="24"
          helpTip="CORE_WF_APPR.CORE_WF_DALY" />
      </el-row>
      <el-row v-if="dg.wfRejectReasonFlag && (form.operate === 'btn_reject' || form.operate === 'btn_delete')">
        <szd-select-form-item-col label="操作原因" v-model="form.operateReason" baseField="CORE_WF_OPRE" :span="24" required />
      </el-row>
      <el-row v-if="form.operate === 'btn_reject' && dg.rejectAct">
        <szd-radio-form-item-col
          label="驳回方式"
          v-model="form.rejectToFlag"
          :baseArr="
            !form.bussId
              ? [
                  { svalue: 'A', sname: $t('拒绝节点') },
                  { svalue: 'B', sname: $t('发起人') }
                ]
              : [
                  { svalue: 'A', sname: $t('拒绝节点') },
                  { svalue: 'B', sname: $t('发起人') },
                  { svalue: 'C', sname: $t('指定节点') }
                ]
          "
          :span="24" />
        <szd-input-form-item-col
          v-if="form.rejectToFlag === 'C'"
          label="指定驳回节点"
          v-model="form.rejectToNodeName"
          format="upper"
          showHelp
          :help="{ a: 'CORE_WF_REJECT_TO', b: form, c: ['rejectToNodeCode-instId', 'rejectToNodeName-nodeName'], d: [['bussId', form.bussId]] }"
          readonly
          :span="24" />
      </el-row>
      <el-row v-if="form.operate === 'btn_postAddSign'">
        <szd-input-form-item-col
          v-model="form.addUserId"
          label="加签"
          showHelp
          :help="{ a: 'CORE_USER', b: form, c: ['addUserId-userId', 'addUserName-userName'] }"
          :span="24"
          readonly
          :descSpan="16"
          :desc="form.addUserName" />
      </el-row>
      <el-row>
        <szd-input-form-item-col
          label="@用户ID"
          v-model="form.noticeUserIds"
          format="upper,"
          showHelp
          :help="{ a: 'CORE_USER', b: form, c: ['noticeUserIds-userId', 'noticeUserNames-userName'], f: 5, i: 'noticeUserIds-userId' }"
          clearable
          :span="24"
          @change="handleChangeNoticeUserIds" />
      </el-row>
      <el-row>
        <szd-input-form-item-col label="@用户姓名" v-model="form.noticeUserNames" disabled :span="24" />
      </el-row>
    </el-form>

    <template #footer>
      <szd-button label="确定并关闭" type="primary" @click="okayForm(true)" />
      <szd-button label="确定" type="primary" @click="okayForm(false)" />
      <szd-button label="取消" type="primary" @click="closeForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { nextTick, ref } from "vue";
  import { $m, $t } from "../../common/utils/globalConfig";
  //更新数据对象
  const emit = defineEmits(["okaySubmit"]);
  //功能参数
  const dg = ref({
    title: "审批意见",
    open: false,
    wfRejectReasonFlag: false,
    rejectAct: false
  });
  //表单参数
  const form = ref({
    operate: "", //操作事件
    operateOkayClose: false, //确认并关闭
    bussId: "", //单据ID
    comments: "", //审批意见
    noticeUserIds: "", //@用户ID
    noticeUserNames: "", //@用户姓名
    addUserId: "", //加签ID
    addUserName: "", //加签姓名
    dailyItem: "", //日常用语
    operateReason: "", //操作原因
    operateReasonName: "",
    rejectToFlag: "A", //驳回方式
    rejectToNodeCode: "", //驳回节点
    rejectToNodeName: ""
  });

  //接受并处理
  const callWfDgAppr = (operate, btnParam = {}, bussId = "", wfRejectReasonFlag = false) => {
    initData();
    form.value.operate = operate;
    form.value.bussId = bussId;
    dg.value.wfRejectReasonFlag = wfRejectReasonFlag === true;
    dg.value.rejectAct = btnParam.rejectAct === true;
    if (btnParam && btnParam.comments) {
      form.value.comments = btnParam.comments;
    }
    if (btnParam && btnParam.closeDg) {
      emit("okaySubmit", form.value);
    } else {
      dg.value.open = true;
    }
  };

  //确定
  const okayForm = operateOkayClose => {
    if (checkOkayForm()) {
      form.value.operateOkayClose = operateOkayClose;
      emit("okaySubmit", form.value);
      dg.value.open = false;
    }
  };

  // 检查提交数据
  const checkOkayForm = () => {
    if (!form.value.comments || form.value.comments.trim() === "") {
      $m("CORE_CLIENT.E106"); //审批意见不能为空
      return false;
    }
    if (form.value.rejectToFlag === "C" && !form.value.rejectToNodeCode) {
      $m("CORE_CLIENT.E115"); //驳回节点不能为空
      return false;
    }
    if (form.value.operate === "btn_postAddSign") {
      if (!form.value.addUserId || form.value.addUserId.trim() === "") {
        $m("CORE_CLIENT.E107"); //加签用户不能为空
        return false;
      }
    }
    if (dg.value.wfRejectReasonFlag && (form.value.operate === "btn_reject" || form.value.operate === "btn_delete")) {
      if (!form.value.operateReason || form.value.operateReason.trim() === "") {
        $m("CORE_CLIENT.E116"); //操作原因不能为空
        return false;
      }
    }
    return true;
  };

  //关闭
  const closeForm = () => {
    dg.value.open = false;
  };

  //常用语赋值审批意见
  const changeComments = (v, res) => {
    if (res.sname) {
      form.value.comments = form.value.comments + res.sname;
    }
    form.value.dailyItem = "";
  };

  const handleChangeNoticeUserIds = () => {
    nextTick(() => {
      if (!form.value.noticeUserIds) form.value.noticeUserNames = "";
    });
  };

  //初始化数据
  const initData = () => {
    form.value = {
      operate: "", //操作事件
      operateOkayClose: false, //确认并关闭
      bussId: "", //单据ID
      comments: "", //审批意见
      noticeUserIds: "", //@用户ID
      noticeUserNames: "", //@用户姓名
      addUserId: "", //加签ID
      addUserName: "", //加签姓名
      dailyItem: "", //日常用语
      operateReason: "", //操作原因
      operateReasonName: "",
      rejectToFlag: "A", //驳回方式
      rejectToNodeCode: "", //驳回节点
      rejectToNodeName: ""
    };
  };

  //定义父组件可用方法
  defineExpose({
    callWfDgAppr
  });
</script>
