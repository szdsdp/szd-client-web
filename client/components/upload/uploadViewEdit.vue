<template>
  <el-dialog
    :title="$t('更新文件')"
    v-model="dg.open"
    append-to-body
    class="app-dialog-container"
    @close="handleClose"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="[500, 300]" />

    <el-form class="app-el-form">
      <el-row>
        <szd-input-form-item-col v-model="dataObj.fileName" label="文件名称" :disabled="dataObj.fileDel" :maxlength="64" required :span="24" />
        <szd-checkbox-form-item-col v-model="dataObj.fileDel" label="删除" disabled :span="24" />
      </el-row>
    </el-form>

    <template #footer>
      <szd-button v-if="dataObj.fileDel" label="撤回删除" type="primary" @click="handleSave(false)" />
      <szd-button v-if="!dataObj.fileDel" label="删除" type="primary" @click="handleSave(true)" />
      <szd-button v-if="!dataObj.fileDel" label="保存" type="primary" @click="handleSave(false)" />
      <szd-button label="取消" type="primary" @click="handleCancel" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { $t } from "../../common/utils/globalConfig";
  import szdFile from "../../common/tools/fileTool";
  import { szdPopDel } from "../../common/message/popup";

  const dataObj = ref({
    fileObjId: "",
    fileId: "",
    fileName: "",
    fileExt: "",
    fileDel: false
  });

  const emit = defineEmits(["updFile"]);

  //窗口对象
  const dg = ref({
    open: false
  });

  const callUploadViewEdit = file => {
    dataObj.value.fileObjId = file.fileObjId;
    dataObj.value.fileId = file.fileId;
    dataObj.value.fileName = file.name;
    dataObj.value.fileExt = szdFile.getFileExtension(file.name);
    dataObj.value.fileDel = file.fileDel === true;
    dg.value.open = true;
  };

  //保存数据
  const handleSave = fileDel => {
    if (fileDel) {
      szdPopDel("文件将被删除，请确认？").then(() => {
        processSave(fileDel);
      });
    } else {
      processSave(fileDel);
    }
  };

  const processSave = fileDel => {
    let ext = szdFile.getFileExtension(dataObj.value.fileName);
    if (ext !== dataObj.value.fileExt) {
      dataObj.value.fileName = dataObj.value.fileName + "." + dataObj.value.fileExt;
    }
    dataObj.value.fileDel = fileDel;
    emit("updFile", dataObj.value);
    dg.value.open = false;
  };

  //取消
  const handleCancel = () => {
    dg.value.open = false;
  };

  const handleClose = () => {};

  //定义调用组件
  defineExpose({
    callUploadViewEdit
  });
</script>
