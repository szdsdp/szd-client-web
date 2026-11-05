<template>
  <el-table border stripe :data="objData.cmpSkillList">
    <el-table-column :label="$t('Skill代码')" prop="skillCode" width="180" />
    <el-table-column :label="$t('Skill名称')" prop="skillName" width="250" />
    <el-table-column :label="$t('路由代码')" prop="routerName" min-width="250" />
    <el-table-column :label="$t('启用')" prop="status" width="100" align="center" />
    <el-table-column :label="$t('Skill类型')" prop="skillTypeName" min-width="150" />
    <el-table-column :label="$t('技能描述')" prop="skillDesc" min-width="250" />
    <el-table-column :label="$t('技能进参')" prop="inputSchema" min-width="250">
      <template v-slot="scope">
        <szd-hlt-div :code="scope.row.inputSchema" :length="25" />
      </template>
    </el-table-column>
    <el-table-column :label="$t('技能出参')" prop="outputSchema" min-width="250">
      <template v-slot="scope">
        <szd-hlt-div :code="scope.row.outputSchema" :length="25" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
  import { $t } from "../../../../common/utils/globalConfig";
  const props = defineProps({
    objData: {
      type: Object
    },
    btnArr: {
      type: Array
    }
  });
</script>
