<template>
  <div class="szd__tb__wrapper">
    <!-- 功能按钮 -->
    <div class="main-table-title">
      <div class="main-table-title-left" style="width: 50%"></div>
      <div class="main-table-title-right" style="width: 50%">
        <el-upload
          v-if="mDg.option !== 'V'"
          action="#"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="handleFileChange"
          accept=".txt,.pdf,.doc,.docx,.md,.csv,.xls,.xlsx">
          <szd-button label="上传文档" type="primary" icon="Upload" link />
        </el-upload>
      </div>
    </div>
    <!-- 表格输出 -->
    <el-table border stripe :data="objData.docList">
      <el-table-column v-if="mDg.option !== 'V'" align="center" type="selection" width="40" />
      <el-table-column :label="$t('文件ID')" prop="fileId" min-width="180" />
      <el-table-column :label="$t('文件名称')" prop="fileName" min-width="300" />
      <el-table-column :label="$t('操作')" width="120" fixed="right" align="center">
        <template #default="scope">
          <szd-button v-if="mDg.option === 'V'" label="段显示" type="primary" link icon="View" @click="handleEditDoc(scope.row)" />
          <szd-button v-if="mDg.option !== 'V'" label="段编辑" type="primary" link icon="Edit" @click="handleEditDoc(scope.row)" />
          <szd-button v-if="mDg.option !== 'V'" label="删除" type="primary" link icon="Delete" @click="handleDelDoc(scope.row)" />
        </template>
      </el-table-column>
    </el-table>
    <knowledgeBaseInfoDocSeg ref="refKnowledgeBaseInfoDocSeg" />
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import { $mE, $mS, $t } from "../../../../common/utils/globalConfig";
  import { szdPopDel } from "../../../../common/message/popup";
  import { deleteDocApi, uploadDocApi } from "../../api/knowledgeBase";
  import knowledgeBaseInfoDocSeg from "./knowledgeBaseInfoDocSeg.vue";

  const emit = defineEmits(["refreshData"]);
  //子屏幕
  const refKnowledgeBaseInfoDocSeg = ref();

  const props = defineProps({
    objData: {
      type: Object
    },
    mDg: {
      type: Object
    }
  });

  // 上传文件
  const handleFileChange = file => {
    const formData = new FormData();
    formData.append("file", file.raw);
    formData.append("kbId", props.objData.header.kbId);
    formData.append("orgType", props.mDg.orgType);
    if (props.mDg.userId) formData.append("userId", props.mDg.userId);

    uploadDocApi(formData)
      .then(res => {
        if (res.code === 200) {
          $mS("上传成功");
          emit("refreshData");
        } else {
          $mE("上传失败");
        }
      })
      .catch(() => {
        $mE("上传失败");
      });
  };
  // 编辑文档
  const handleEditDoc = row => {
    refKnowledgeBaseInfoDocSeg.value.callKnowledgeBaseDocSeg({
      option: props.mDg.option,
      kbId: props.objData.header.kbId,
      fileId: row.fileId,
      fileName: row.fileName
    });
  };
  // 删除文档
  const handleDelDoc = row => {
    szdPopDel().then(() => {
      deleteDocApi(props.objData.header.kbId, row.fileId).then(res => {
        if (res.code === 200) {
          $mS("删除成功");
          emit("refreshData");
        }
      });
    });
  };
</script>
