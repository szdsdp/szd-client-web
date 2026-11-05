<template>
  <el-table border stripe :data="objData.cmpPromptList">
    <el-table-column :label="$t('行号')" prop="itemNo" width="80" align="center" />
    <el-table-column :label="$t('排序')" prop="promptSort" width="100" align="center" />
    <el-table-column :label="$t('提示词标题')" prop="title" width="200" />
    <el-table-column :label="$t('提示词内容')" prop="content" min-width="300">
      <template v-slot="scope">
        <szd-hlt-div :code="scope.row.content" :length="50" />
      </template>
    </el-table-column>
    <el-table-column :label="$t('功能按钮')" prop="btnCode" width="180">
      <template #default="scope">
        {{ handleBtnName(scope.row.btnCode) }}
      </template>
    </el-table-column>
    <el-table-column :label="$t('Skill代码')" prop="skillCode" min-width="180" />
    <el-table-column :label="$t('Skill名称')" prop="skillName" min-width="200" />
    <el-table-column :label="$t('SQL语句')" prop="skillSql" min-width="300">
      <template v-slot="scope">
        <szd-hlt-div :code="scope.row.skillSql" />
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
  //按钮名称
  const handleBtnName = btnCode => {
    const btnObj = props.btnArr.find(r => r.svalue === btnCode);
    return btnObj ? btnCode + "." + btnObj.sname : btnCode;
  };
</script>
