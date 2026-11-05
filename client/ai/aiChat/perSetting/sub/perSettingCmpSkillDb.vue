<template>
  <el-table border stripe :data="objData.cmpSkillDbList">
    <el-table-column :label="$t('表代码')" prop="tableCode" min-width="180" />
    <el-table-column :label="$t('表名称')" prop="tableName" min-width="250" />
    <el-table-column :label="$t('技能描述')" prop="tableSkillDesc" min-width="300" />
    <el-table-column :label="$t('表来源')" prop="tableSource" width="100" align="center" />
    <el-table-column :label="$t('sysCode')" prop="应用系统" min-width="150" align="center" />
    <el-table-column :label="$t('操作')" width="80" fixed="right" align="center">
      <template #default="scope">
        <szd-button label="详情" type="primary" link icon="View" @click="handleRowView(scope.row)" />
      </template>
    </el-table-column>
  </el-table>

  <!-- 显示列字段 -->
  <el-dialog
    :title="$t('详情')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="['1000', '600']" />
    <el-table border stripe :data="dataObj.itemList">
      <el-table-column :label="$t('字段代码')" prop="fieldCode" min-width="150" />
      <el-table-column :label="$t('字段名称')" prop="fieldName" min-width="150" />
      <el-table-column :label="$t('字段技能描述')" prop="fieldSkillDesc" min-width="300" />
      <el-table-column :label="$t('数据类型')" prop="fieldType" width="120" align="center" />
      <el-table-column :label="$t('主键')" prop="isPk" width="80" align="center" />
    </el-table>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { $t } from "../../../../common/utils/globalConfig";
  import { getTableConfig } from "../../api/perSetting";

  const props = defineProps({
    objData: {
      type: Object
    },
    btnArr: {
      type: Array
    }
  });

  const dg = ref({
    open: false
  });

  const dataObj = ref({
    itemList: []
  });

  const handleRowView = row => {
    dg.value.open = true;
    dataObj.value.itemList = [];
    getTableConfig(row.sysCode, row.tableCode).then(res => {
      if (res.code === 200 && res.data) {
        dataObj.value = res.data;
      }
    });
  };
</script>
