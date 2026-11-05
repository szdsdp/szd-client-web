<template>
  <el-table border stripe :data="objData.cmpHarnessList">
    <el-table-column :label="$t('业务规范ID')" prop="harnessId" width="150" />
    <el-table-column :label="$t('业务规范名称')" prop="harnessName" width="250" />
    <el-table-column :label="$t('启用')" prop="status" width="80" align="center" />
    <el-table-column :label="$t('功能按钮')" prop="btnCode" width="180">
      <template #default="scope">
        {{ handleBtnName(scope.row.btnCode) }}
      </template>
    </el-table-column>
    <el-table-column :label="$t('业务规范内容')" prop="content" min-width="300">
      <template v-slot="scope">
        <szd-hlt-div :code="scope.row.content" :length="50" />
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
