<template>
  <el-table border stripe :data="objData.cmpKbList">
    <el-table-column :label="$t('知识库ID')" prop="kbId" width="150" />
    <el-table-column :label="$t('知识库名称')" prop="kbName" width="250" />
    <el-table-column :label="$t('启用')" prop="status" width="80" align="center" />
    <el-table-column :label="$t('功能按钮')" prop="btnCode" width="180">
      <template #default="scope">
        {{ handleBtnName(scope.row.btnCode) }}
      </template>
    </el-table-column>
    <el-table-column :label="$t('知识库备注')" prop="remark" min-width="300" />
    <el-table-column :label="$t('操作')" width="80" fixed="right" align="center">
      <template #default="scope">
        <szd-button label="详情" type="primary" link icon="View" @click="handleViewRow(scope.row)" />
      </template>
    </el-table-column>
  </el-table>

  <subKnowledgeBaseInfo ref="refSubKnowledgeBaseInfo" />
</template>

<script setup>
  import { ref } from "vue";
  import { $t } from "../../../../common/utils/globalConfig";
  import subKnowledgeBaseInfo from "../subKnowledgeBase/subKnowledgeBaseInfo.vue";
  //子屏幕
  const refSubKnowledgeBaseInfo = ref();

  const props = defineProps({
    objData: {
      type: Object
    },
    btnArr: {
      type: Array
    }
  });
  //按钮名称
  const handleBtnName = btnCode => {
    const btnObj = props.btnArr.find(r => r.svalue === btnCode);
    return btnObj ? btnCode + "." + btnObj.sname : btnCode;
  };
  //查看详情
  const handleViewRow = row => {
    refSubKnowledgeBaseInfo.value.callKnowledgeBaseInfo({ option: "V", kbId: row.kbId, orgType: row.orgType, userId: row.userId });
  };
</script>
