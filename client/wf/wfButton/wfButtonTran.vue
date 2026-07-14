<template>
  <!-- 转办选择用户 -->
  <el-dialog
    :title="$t(dg.title)"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="[600, 260]" />
    <el-form class="app-el-form">
      <el-row>
        <szd-textarea-form-item-col label="转办意见" v-model="form.comments" :maxlength="150" :rows="5" show-word-limit :span="24" required />
        <szd-input-form-item-col
          v-model="form.tranUserId"
          label="用户"
          showHelp
          :help="{ a: 'CORE_USER', b: form, c: ['tranUserId-userId', 'tranUserName-userName'] }"
          :span="24"
          readonly
          required
          :descSpan="12"
          :desc="form.tranUserName" />
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
  import { ref } from "vue";
  import { $m, $t } from "../../common/utils/globalConfig";
  //更新数据对象
  const emit = defineEmits(["okaySubmit"]);
  //功能参数
  const dg = ref({
    title: "任务转办",
    open: false
  });
  //表单参数
  const form = ref({
    operate: "", //操作事件
    operateOkayClose: false, //确认并关闭
    comments: "", //转办意见
    tranUserId: "", //转办和前加签
    tranUserName: "" //转办和前加姓名
  });

  //接受并处理
  const callWfDgTran = (operate, btnParam = {}) => {
    initData();
    dg.value.open = true;
    form.value.operate = operate;
    if (btnParam && btnParam.comments) {
      form.value.comments = btnParam.comments;
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
      $m("CORE_CLIENT.E114"); //转办意见不能为空
      return false;
    }
    if (!form.value.tranUserId || form.value.tranUserId.trim() === "") {
      $m("CORE_CLIENT.E108"); //用户不能为空
      return false;
    }
    return true;
  };

  //关闭
  const closeForm = () => {
    dg.value.open = false;
  };

  //初始化数据
  const initData = () => {
    form.value = {
      operate: "", //操作事件
      operateOkayClose: false, //确认并关闭
      comments: "", //转办意见
      tranUserId: "", //转办和前加签
      tranUserName: "" //转办和前加姓名
    };
  };

  //定义父组件可用方法
  defineExpose({
    callWfDgTran
  });
</script>
