<template>
  <el-dialog
    :title="$t(dg.title)"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="['90%', '80%']" />

    <el-tabs v-model="dg.actTab">
      <el-tab-pane :label="$t('影像')" name="Tab1">
        <wfConsumeInvImg :objData="objData" :bussParam="bussParam" />
      </el-tab-pane>
      <el-tab-pane :label="$t('票夹')" name="Tab2">
        <wfConsumeInvFol :objData="objData" :bussParam="bussParam" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <szd-button label="确定" type="primary" @click="okayForm" />
      <szd-button label="关闭" type="primary" @click="closeForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { onMounted, ref } from "vue";
  import { $t } from "../../common/utils/globalConfig";
  import { wfEisConsumeFolToImg } from "../api/wfComsume";
  import wfConsumeInvImg from "./wfConsumeInvImg.vue";
  import wfConsumeInvFol from "./wfConsumeInvFol";

  //更新
  const emit = defineEmits(["okay"]);

  const props = defineProps({
    bussParam: {
      type: Object,
      default: {
        bussId: "", //业务Id
        bstp: "", //业务类型
        invList: [] //已存在发票号 {invCode，invNo}
      }
    }
  });

  //功能参数
  const dg = ref({
    title: "消费记录",
    open: false,
    actTab: "Tab1"
  });

  //发票清单
  const objData = ref({
    invImg: [],
    invFol: [],
    invImgSel: [],
    invFolSel: []
  });

  onMounted(() => {
    initData();
  });

  //初始化数据
  const initData = () => {
    dg.value.open = true;
  };

  //确定
  const okayForm = () => {
    //合并返回的数据
    let invSel = objData.value.invImgSel;
    //票夹移动到影像
    if (objData.value.invFolSel && objData.value.invFolSel.length > 0) {
      invSel.push(...objData.value.invFolSel);
      let json = { bussId: props.bussParam.bussId, moveList: objData.value.invFolSel };
      wfEisConsumeFolToImg(json).then(() => {});
    }
    emit("okay", invSel);
    dg.value.open = false;
  };

  const handleCloseForm = () => {
    dg.value.open = false;
  };

  //取消
  const closeForm = () => {
    dg.value.open = false;
  };
</script>
