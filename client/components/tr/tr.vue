<template>
  <el-dialog
    :title="$t('请求选择')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
    class="app-dialog-container"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="[800, 600]" />
    <el-form class="app-el-form">
      <szd-textarea-form-item-col label="摘要备注" v-model="dg.operRemark" show-word-limit :maxlength="100" :rows="2" :span="24" />
    </el-form>
    <!-- 功能按钮 -->
    <div class="main-table-title" style="margin-top: 5px">
      <div class="main-table-title-right" style="width: 100%">
        <szd-button label="新增请求" link icon="Plus" @click="addTr" />
      </div>
    </div>
    <!-- 表格输出 -->
    <el-table border stripe :data="trList" class="flex-1" @cell-dblclick="handCellDblclick">
      <el-table-column :label="$t('请求编号')" prop="trCode" min-width="100" />
      <el-table-column :label="$t('请求名称')" prop="trName" min-width="150" />
      <el-table-column :label="$t('创建时间')" prop="createTime" min-width="100" />
      <el-table-column :label="$t('创建人')" prop="createBy" min-width="100" />
    </el-table>
    <template #footer>
      <szd-button label="取消" type="primary" @click="handleCloseForm" />
    </template>
    <trInfo ref="refTrInfo" @updResult="getTrList"></trInfo>
  </el-dialog>
</template>

<script setup>
  import { onMounted, ref } from "vue";
  import { listTrNoRelease } from "../api/tr.js";
  import trInfo from "./trInfo.vue";
  import { $t } from "../../common/utils/globalConfig";

  //定义事件
  const emit = defineEmits(["okay", "closeForm"]);
  // 子屏幕
  const refTrInfo = ref();
  //功能参数
  const dg = ref({
    open: false,
    operRemark: ""
  });
  const trList = ref([]);

  onMounted(() => {
    getTrList();
  });
  //获取后台数据
  const getTrList = () => {
    listTrNoRelease().then(response => {
      if (response.code === 200) {
        trList.value = response.data;
        dg.value.open = true;
      }
    });
  };
  // 双击取值
  const handCellDblclick = row => {
    emit("okay", { trCode: row.trCode, operRemark: dg.value.operRemark, noAct: false });
    dg.value.open = false;
  };

  //新增
  const addTr = () => {
    refTrInfo.value.initNewTr();
  };

  const handleCloseForm = () => {
    dg.value.open = false;
  };

  const handleClose = () => {
    emit("closeForm");
  };
</script>
