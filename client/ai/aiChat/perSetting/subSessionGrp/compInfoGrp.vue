<template>
  <!-- 功能按钮 -->
  <div class="main-table-title">
    <div class="main-table-title-left" style="width: 50%">
      <span>{{ $t("未维护功能按钮表示全部使用") }}</span>
    </div>
    <div class="main-table-title-right" style="width: 50%"></div>
  </div>
  <!-- 表格输出 -->
  <el-table border stripe :data="objData.groupList">
    <el-table-column :label="$t('会话组代码')" prop="groupCode" min-width="150" />
    <el-table-column :label="$t('会话组名称')" prop="groupName" min-width="250" />
    <el-table-column :label="$t('功能按钮')" prop="btnName" min-width="180" />
  </el-table>
</template>

<script setup>
  import { $t } from "../../../../common/utils/globalConfig";
  const props = defineProps({
    objData: {
      type: Object
    }
  });
</script>
