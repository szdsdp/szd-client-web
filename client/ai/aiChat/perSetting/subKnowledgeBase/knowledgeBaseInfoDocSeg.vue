<template>
  <el-dialog
    :title="$t('文档信息')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="['75%', '70%']" />
    <el-table border stripe :data="segList" class="flex-1">
      <el-table-column type="index" :label="$t('序号')" width="50" align="center" />
<!--      <el-table-column prop="segId" :label="$t('段ID')" width="150" align="center" />-->
      <el-table-column :label="$t('内容')" min-width="300">
        <template v-slot="scope">
          <div v-html="scope.row.content" />
        </template>
      </el-table-column>
      <el-table-column v-if="dg.option !== 'V'" :label="$t('操作')" width="120" align="center" fixed="right">
        <template v-slot="scope">
          <szd-button label="编辑" type="primary" link @click="handleRowEdit(scope.row)" icon="Edit" />
          <szd-button label="删除" type="primary" link @click="handleRowDel(scope.row)" icon="Delete" />
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <szd-button label="关闭" type="primary" @click="closeForm" />
    </template>
    <knowledgeBaseInfoDocSegEdit ref="refKnowledgeBaseInfoDocSegEdit" />
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { $mS, $t } from "../../../../common/utils/globalConfig";
  import { szdPopDel } from "../../../../common/message/popup";
  import { deleteSegApi, getSegListApi } from "../../api/knowledgeBase";
  import knowledgeBaseInfoDocSegEdit from "./knowledgeBaseInfoDocSegEdit.vue";

  //子屏幕
  const refKnowledgeBaseInfoDocSegEdit = ref();
  //窗口参数
  const dg = ref({
    open: false,
    option: "",
    kbId: "",
    fileId: "",
    fileName: ""
  });
  const segList = ref([]);

  const callKnowledgeBaseDocSeg = infoParam => {
    dg.value.option = infoParam.option;
    dg.value.kbId = infoParam.kbId;
    dg.value.fileId = infoParam.fileId;
    dg.value.fileName = infoParam.fileName;
    segList.value = [];
    getSegListApi(dg.value.kbId, dg.value.fileId).then(res => {
      if (res.code === 200) {
        segList.value = res.data && res.data.data ? res.data.data : [];
      }
    });
    dg.value.open = true;
  };
  //编辑段信息
  const handleRowEdit = row => {
    refKnowledgeBaseInfoDocSegEdit.value.callKnowledgeBaseDocSegEdit(dg.value.kbId, dg.value.fileId, row);
  };
  //删除段信息
  const handleRowDel = row => {
    szdPopDel().then(() => {
      deleteSegApi(dg.value.kbId, dg.value.fileId, row.segId).then(res => {
        if (res.code === 200) {
          $mS("删除成功");
          segList.value = segList.value.filter(s => s.segId !== row.segId);
        }
      });
    });
  };
  //关闭表单
  const closeForm = () => {
    dg.value.open = false;
  };
  //调用方法
  defineExpose({ callKnowledgeBaseDocSeg });
</script>
