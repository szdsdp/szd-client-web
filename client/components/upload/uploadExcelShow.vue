<template>
  <!-- Excel前端导入显示 -->
  <el-dialog
    :title="$t(props.uploadParams.title)"
    v-model="dg.open"
    append-to-body
    class="app-dialog-container"
    @close="handleClose"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="['80%', '80%']" />

    <!-- 导入数据 -->
    <szd-table :layout="lay.layout" :fieldCat="props.fCats" v-model:data="impDataList" border stripe />

    <template #footer>
      <szd-button label="确认" type="primary" @click="handleOkay" />
      <szd-button label="取消" type="primary" @click="handleCancel" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { $t } from "../../common/utils/globalConfig";

  const props = defineProps({
    uploadParams: {
      type: Object,
      default: {}
    },
    fCats: {
      type: Object,
      default: []
    }
  });

  //凭证分录
  const lay = ref({
    layout: { pagination: "0", viewMode: "1", showIndex: props.uploadParams.showIndex === true }
  });

  const impDataList = ref([]);

  const emit = defineEmits(["showOkay", "showCancel"]);

  //窗口对象
  const dg = ref({
    open: false
  });

  //初始化上传参数
  const callShowImpExcelData = impData => {
    impDataList.value = impData;
    dg.value.open = true;
  };

  //确认
  const handleOkay = () => {
    dg.value.open = false;
    emit("showOkay", impDataList.value);
  };

  //取消
  const handleCancel = () => {
    dg.value.open = false;
  };

  const handleClose = () => {
    emit("showCancel");
  };

  //定义调用组件
  defineExpose({
    callShowImpExcelData
  });
</script>
