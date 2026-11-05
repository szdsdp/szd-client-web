<template>
  <el-dialog
    :title="$t('段编辑')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="['60%', '60%']" />
    <el-form class="app-el-form l-from-textarea">
      <szd-textarea v-model="segObj.content" :rows="20" :maxlength="20000" style="width: 100%; height: 100%" />
    </el-form>
    <template #footer>
      <szd-button label="保存" type="primary" @click="saveSeg" />
      <szd-button label="关闭" type="primary" @click="closeForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { $mE, $mS, $t } from "../../../../common/utils/globalConfig";
  import { updateSegApi } from "../../api/knowledgeBase";

  //窗口参数
  const dg = ref({
    open: false
  });
  const segObj = ref({
    kbId: "",
    fileId: "",
    segId: "",
    content: ""
  });
  const segRow = ref({});

  const callKnowledgeBaseDocSegEdit = (kbId, fileId, row) => {
    segRow.value = row;
    segObj.value.kbId = kbId;
    segObj.value.fileId = fileId;
    segObj.value.segId = row.segId;
    segObj.value.content = row.content;
    dg.value.open = true;
  };
  //保存段信息
  const saveSeg = () => {
    updateSegApi(segObj.value).then(res => {
      if (res.code === 200) {
        segRow.value.content = segObj.value.content;
        $mS("保存成功");
        dg.value.open = false;
      } else {
        $mE("保存失败");
      }
    });
  };
  const closeForm = () => {
    dg.value.open = false;
  };
  //调用方法
  defineExpose({ callKnowledgeBaseDocSegEdit });
</script>

<style scoped lang="scss">
  .l-from-textarea {
    height: 100%;

    :deep(.el-textarea__inner) {
      height: 100%;
    }
  }
</style>
