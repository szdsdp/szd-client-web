<template>
  <el-dialog
    :title="$t('会话数据')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    @close="handleCloseForm"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="['85%', '80%']" />
    <el-tabs v-model="dg.actTab">
      <el-tab-pane :label="$t('会话记录')" name="TAB1">
        <sessionRecord :mDg="dg" />
      </el-tab-pane>
      <el-tab-pane :label="$t('自动任务')" name="TAB2">
        <sessionAutoTaskAuth :mDg="dg" />
      </el-tab-pane>
      <el-tab-pane :label="$t('任务记录')" name="TAB3">
        <sessionAutoTaskRecord :mDg="dg" />
      </el-tab-pane>
      <el-tab-pane :label="$t('Token统计')" name="TAB6">
        <tokenPanel :mDg="dg" />
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import store from "~store";
  import { $t } from "../../../common/utils/globalConfig";
  import sessionRecord from "./sessionRecord/sessionRecord.vue";
  import sessionAutoTaskAuth from "./sessionAutoTaskAuth/sessionAutoTaskAuth.vue";
  import sessionAutoTaskRecord from "./sessionAutoTaskRecord/sessionAutoTaskRecord.vue";
  import tokenPanel from "./tokenPanel/tokenPanel.vue";

  const emit = defineEmits(["refresh"]);
  //窗口对象
  const dg = ref({
    open: false,
    actTab: "TAB1",
    userId: store.state.loginUser.user.userId,
    retCode: ""
  });

  //打开窗口
  const callPerHisData = () => {
    dg.value.open = true;
    dg.value.retCode = "";
  };

  //关闭窗口
  const handleCloseForm = () => {
    if (dg.value.retCode === "S") emit("refresh");
  };

  defineExpose({
    callPerHisData
  });
</script>
