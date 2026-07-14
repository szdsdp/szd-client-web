<template>
  <el-dialog
    :title="$t('打印模板')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
    class="app-dialog-container"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="[800, 450]" />
    <el-table border stripe :data="printTemplate" class="flex-1" @selection-change="handleSelRow">
      <el-table-column v-if="moreTemplate" align="center" type="selection" width="40" />
      <el-table-column :label="$t('标识')" prop="light" width="50" align="center">
        <template #default="scope">
          <szd-light :light="scope.row.isAll ? '3' : '2'" />
        </template>
      </el-table-column>
      <el-table-column prop="templateName" :label="$t('打印模板')" min-width="200">
        <template #default="scope">
          <span class="link-type" @click="handleClickRow(scope.row)">{{ scope.row.templateName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="isAll" width="130" align="center">
        <template #header>
          <szd-table-col-header label="支持全部单据" helpTip="CORE_CLIENT_SCP_PRT.printIsAll" />
        </template>
        <template #default="scope">
          {{ scope.row.isAll ? $t("是") : $t("否") }}
        </template>
      </el-table-column>
      <el-table-column width="130" align="center">
        <template #header>
          <szd-table-col-header label="支持按单连打" helpTip="CORE_CLIENT_SCP_PRT.printIsConnect" />
        </template>
        <template #default="scope">
          {{ scope.row.routerCode === "CORE_SCP_03P" ? $t("是") : $t("否") }}
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <szd-button v-if="moreTemplate" label="打印" type="primary" @click="okayForm" />
      <szd-button label="取消" type="primary" @click="handleCloseForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { $mW, $t } from "../../common/utils/globalConfig";
  //定义事件
  const emit = defineEmits(["okay", "closeForm"]);

  const props = defineProps({
    printTemplate: {
      type: Array,
      default: []
    },
    moreTemplate: {
      type: Boolean,
      default: true
    }
  });

  //功能参数
  const dg = ref({
    open: false
  });
  const listSel = ref([]);

  onMounted(() => {
    dg.value.open = true;
  });

  //选择数据
  const handleSelRow = selection => {
    listSel.value = selection;
  };

  //点击单元格
  const handleClickRow = row => {
    emit("okay", [row]);
    dg.value.open = false;
  };

  //确定
  const okayForm = () => {
    if (listSel.value.length === 0) {
      $mW("请至少选择一行需要处理的数据");
      return;
    }
    emit("okay", listSel.value);
    dg.value.open = false;
  };

  const handleCloseForm = () => {
    dg.value.open = false;
  };

  const handleClose = () => {
    emit("closeForm");
  };
</script>
