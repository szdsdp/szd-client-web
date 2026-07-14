<template>
  <div class="app-sub-container szd__tb__wrapper" style="padding: 0">
    <!-- 查询条件 -->
    <el-form :model="query" ref="queryForm" class="app-el-form">
      <el-row>
        <szd-input-form-item-col
          label="所属票夹"
          v-model="query.folderId"
          showHelp
          :help="{ a: 'SEIS_FOL_FOL', b: query, c: ['folderId'] }"
          :span="8" />
        <szd-input-form-item-col label="附件名称" v-model="query.attachName" :span="8" />
        <szd-date-form-item-col label="上传日期" v-model="query.date" type="daterange" :span="8" />
      </el-row>
    </el-form>

    <!-- 功能按钮 -->
    <div class="main-button">
      <div class="main-button-left" style="width: 50%"></div>
      <div class="main-button-right" style="width: 50%">
        <szd-button label="搜索" type="primary" icon="Search" @click="handleQuery" />
        <szd-button label="重置" type="primary" icon="Refresh" @click="resetQuery" />
      </div>
    </div>
    <el-table border stripe :data="_objData.invFol" @selection-change="handleSelRow" :span-method="handleSpanMethod" class="flex-1">
      <el-table-column align="center" type="selection" width="40" />
      <wfConsumeInvColCat :bussParam="bussParam" />
      <el-table-column :label="$t('附件名称')" prop="attachName" min-width="150" />
      <el-table-column :label="$t('所属票夹')" prop="folderName" min-width="170" />
      <el-table-column :label="$t('上传时间')" prop="createTime" min-width="170" />
    </el-table>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from "vue";
  import { $t } from "../../common/utils/globalConfig";
  import wfConsumeInvColCat from "./wfConsumeInvColCat.vue";
  import { wfEisConsumeFol } from "../api/wfComsume";

  const emit = defineEmits(["update:objData"]);

  const props = defineProps({
    bussParam: {
      type: Object
    },
    objData: {
      type: Object,
      default: {}
    }
  });

  const _objData = computed({
    get: () => props.objData,
    set: val => {
      emit("update:objData", val);
    }
  });

  const query = ref({
    bussId: "",
    bstp: "",
    invList: [],
    folderId: "",
    attachName: "",
    date: []
  });

  const mergeRow = ref([]);

  onMounted(() => {
    resetQuery();
  });

  const initData = () => {
    query.value.bussId = "";
    query.value.bstp = "";
    query.value.invList = [];
    query.value.folderId = "";
    query.value.attachName = "";
    query.value.date = [];
    mergeRow.value = [];
  };

  //重置
  const resetQuery = () => {
    initData();
    handleQuery();
  };

  //查询数据
  const handleQuery = () => {
    query.value.bussId = props.bussParam.bussId;
    query.value.bstp = props.bussParam.bstp;
    query.value.invList = props.bussParam.invList;
    query.value.startTime = null;
    query.value.endTime = null;
    if (query.value.date && query.value.date.length > 0) {
      query.value.startTime = query.value.date[0];
      query.value.endTime = query.value.date[1];
    }
    wfEisConsumeFol(query.value).then(res => {
      if (res.code === 200) {
        _objData.value.invFol = res.data;
        setRowSpans();
      }
    });
  };

  //设置合并行数据
  const setRowSpans = () => {
    let rowspan = 0;
    let attachId = "";
    for (let i = 0; i < _objData.value.invFol.length; i++) {
      let item = _objData.value.invFol[i];
      if (i === 0) {
        attachId = item.attachId;
        rowspan = 1;
      } else {
        if (attachId === item.attachId) {
          rowspan++;
        } else {
          mergeRow.value.push({ rowIndex: i, rowspan: rowspan });
          attachId = item.attachId;
          rowspan = 1;
        }
      }
    }
  };

  const handleSelRow = selection => {
    _objData.value.invFolSel = selection;
  };

  //合并行
  const handleSpanMethod = ({ rowIndex, column }) => {
    if (["attachName", "folderName", "createTime"].includes(column.property) && mergeRow.value.length > 0) {
      const _merge = mergeRow.value.find(r => r.rowIndex === rowIndex);
      if (_merge) {
        return { rowspan: _merge.rowspan, colspan: 1 };
      }
    }
  };
</script>