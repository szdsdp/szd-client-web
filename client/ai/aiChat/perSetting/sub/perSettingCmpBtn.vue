<template>
  <el-table border stripe :data="objData.cmpBtnList">
    <el-table-column :label="$t('排序')" prop="btnSort" width="80" align="center" />
    <el-table-column :label="$t('功能按钮')" prop="btnCode" width="120" />
    <el-table-column :label="$t('功能按钮名称')" prop="btnName" width="150" />
    <el-table-column :label="$t('功能模式')" prop="btnMode" width="120" />
    <el-table-column :label="$t('功能模式名称')" prop="btnModeName" width="150" />
    <el-table-column :label="$t('提示词信息')" prop="btnPrompt" min-width="300">
      <template v-slot="scope">
        <szd-hlt-div :code="handleGetRowBtnPrompt(scope.row)" :length="25" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
  import { onBeforeMount, ref } from "vue";
  import { $t } from "../../../../common/utils/globalConfig";
  import szdTool from "../../../../common/tools/tool";
  const props = defineProps({
    objData: {
      type: Object
    },
    btnArr: {
      type: Array
    }
  });

  const _aiConfig = ref([]);

  onBeforeMount(() => {
    getGlobalConfig();
  });

  const getGlobalConfig = () => {
    szdTool.getGlobalList("SKIS_AI_CHAT_CONFIG").then(res => {
      _aiConfig.value = res || [];
    });
  };

  const handleGetRowBtnPrompt = row => {
    if (row.btnPrompt) return row.btnPrompt;
    return getBtnModePrompt(row.btnMode);
  };

  const getBtnModePrompt = btnMode => {
    if (!btnMode) return "";
    const gObj = _aiConfig.value.find(obj => obj.configKey === "SKIS_AI_BTN_MODE_" + btnMode.toUpperCase());
    return gObj ? gObj.configValue : "";
  };
</script>
