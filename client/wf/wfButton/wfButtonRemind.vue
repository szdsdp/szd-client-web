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
        <szd-textarea-form-item-col label="催办消息" v-model="form.comments" :maxlength="150" :rows="5" show-word-limit :span="24" />
      </el-row>
    </el-form>

    <template #footer>
      <szd-button label="确定" type="primary" @click="okayForm" />
      <szd-button label="取消" type="primary" @click="closeForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { $mE, $mS, $t } from "../../common/utils/globalConfig";
  import { wfRemind } from "../api/wfApi";
  //功能参数
  const dg = ref({
    title: "任务催办",
    open: false
  });
  //表单参数
  const form = ref({
    operate: "", //操作事件
    bussId: "", //业务ID
    comments: "" //催办消息
  });

  //接受并处理
  const callWfDgRemind = (operate, bussId) => {
    initData();
    dg.value.open = true;
    form.value.operate = operate;
    form.value.bussId = bussId;
  };

  //确定
  const okayForm = () => {
    wfRemind(form.value).then(res => {
      if (res.code === 200) {
        $mS("催办成功");
        dg.value.open = false;
      } else {
        $mE("催办失败:" + res.msg);
      }
    });
  };

  //关闭
  const closeForm = () => {
    dg.value.open = false;
  };

  //初始化数据
  const initData = () => {
    form.value = {
      operate: "", //操作事件
      bussId: "", //业务ID
      comments: "" //催办消息
    };
  };

  //定义父组件可用方法
  defineExpose({
    callWfDgRemind
  });
</script>
