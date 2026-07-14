<template>
  <div class="app-sub-container app-sub-sub szd__tb__wrapper drag-area">
    <!--  输出表格  -->
    <el-table
      ref="refTable"
      :data="_dataObj"
      :row-style="handleRowStyle"
      :cell-style="handleCellStyle"
      :header-cell-class-name="handleHeaderCellClassName"
      :show-summary="_lay.layout.showSummary"
      :summary-method="handleSummaryMethod"
      :span-method="handleSpanMethod"
      @sort-change="handleSortChange"
      v-bind="$attrs"
      :highlight-current-row="_lay.layout.highlightCurrentRow"
      :row-key="_lay.layout.rowKey"
      :key="tableKey"
      height="100%"
      class="flex-1">
      <!-- 拖动手柄 -->
      <el-table-column v-if="_lay.layout.dragRow" label="" align="center" width="36" fixed="left" class-name="main-table-col-cell">
        <template #default="scope">
          <div class="main-drag-handle">
            <el-icon>
              <Sort />
            </el-icon>
          </div>
        </template>
      </el-table-column>
      <!-- 指示灯 -->
      <el-table-column v-if="_lay.layout.light" label="" align="center" width="36" fixed="left" class-name="main-table-col-cell">
        <template #default="scope">
          <szd-light :light="scope.row[_lay.layout.light]" />
        </template>
      </el-table-column>
      <!-- 详情 -->
      <el-table-column v-if="_lay.layout.viewMode !== '0'" label="" align="center" width="36" fixed="left" class-name="main-table-col-cell">
        <template #default="scope">
          <el-button type="primary" link icon="View" @click="handleRowView(scope.row, scope.$index)" />
        </template>
      </el-table-column>
      <!-- 复选框 -->
      <el-table-column
        v-if="_lay.layout.selection !== '0'"
        type="selection"
        align="center"
        width="50"
        :fixed="_lay.layout.selection === '2' ? 'left' : false"
        :selectable="handleColumnSelectable" />
      <!-- 索引行 -->
      <el-table-column v-if="_lay.layout.showIndex" :label="$t('行号')" type="index" align="center" width="45" fixed="left" />
      <!-- 输出列 -->
      <template v-for="fCat in _lay.fCatCol">
        <tableCompColumn :layout="_lay.layout" :layFCat="fCat" @handleRowEvent="handleRowEventImp" />
      </template>
    </el-table>
    <!--  详情  -->
    <tableView ref="refTableView" :oper="oper" @handleRowEvent="handleRowEventImp" @handleNextPage="handleNextPageImp" />
  </div>
</template>

<script setup>
  import { ref, computed, getCurrentInstance, onMounted, nextTick, watch } from "vue";
  import { $t } from "../../common/utils/globalConfig";
  import { dataAdd, dataCopy, dataDel, dataSum } from "./js/tableFunc";
  import { dataSortFilter } from "./js/tableFuncSortFilter";
  import Sortable from "sortablejs";
  import tableCompColumn from "./tableCompColumn.vue";
  import tableView from "./view/tableView.vue";

  const { proxy } = getCurrentInstance();
  //回调事件
  const emit = defineEmits([
    "update:lay",
    "update:dataObj",
    "update:tParObj",
    "handleRequest",
    "handleEvent",
    "handleRowEvent",
    "row-style",
    "cell-style"
  ]);

  const props = defineProps({
    lay: {
      type: Object
    },
    dataObj: {
      type: Array
    },
    tParObj: {
      type: Object
    },
    oper: {
      type: Object
    }
  });
  //表格
  const refTable = ref();
  const refTableView = ref();
  const tableKey = ref("1");
  //表格布局
  const _lay = computed({
    get: () => props.lay,
    set: val => {
      emit("update:lay", val);
    }
  });
  //表格数据
  const _dataObj = computed({
    get: () => props.dataObj,
    set: val => {
      emit("update:dataObj", val);
    }
  });
  //表格参数
  const _tParObj = computed({
    get: () => props.tParObj,
    set: val => {
      emit("update:tParObj", val);
    }
  });

  //加载数据
  onMounted(() => {
    dragRow();
  });
  watch(
    () => tableKey.value,
    () => {
      dragRow();
    }
  );

  //table事件-样式事件-设置行样式，与斑马线冲突stripe
  const handleRowStyle = obj => {
    const layout = _lay.value.layout;
    if (obj.row.$SZDRowHide) {
      return { display: "none" };
    }
    if (layout.styleRow) {
      if (obj.row[layout.styleRow]) {
        return obj.row[layout.styleRow];
      } else {
        emit("row-style", obj);
      }
    }
  };
  //table事件-样式事件-设置单元格
  const handleCellStyle = obj => {
    const layout = _lay.value.layout;
    if (layout.styleCell) {
      if (obj.row[layout.styleCell]) {
        if (obj.column.property && obj.row[layout.styleCell][obj.column.property]) {
          return obj.row[layout.styleCell][obj.column.property];
        }
      } else {
        emit("cell-style", obj);
      }
    }
  };
  //table事件-列头排序图标
  const handleHeaderCellClassName = ({ column }) => {
    if (column.sortable !== "custom") return;
    const l_rule = _lay.value.sortRule.find(item => item.field === column.property);
    if (l_rule && l_rule.order !== null) {
      column.order = l_rule.order;
    } else {
      column.order = null;
    }
  };
  //table事件-排序事件
  const handleSortChange = ({ order, prop }) => {
    const l_index = _lay.value.sortRule.findIndex(item => item.field === prop);
    if (l_index !== -1) {
      _lay.value.sortRule.splice(l_index, 1);
    }
    if (order === "ascending" || order === "descending") {
      _lay.value.sortRule.push({ field: prop, order: order });
    }
    //排序方法调用 2.后端请求
    if (_lay.value.layout.sort === "2") {
      emit("handleRequest");
    } else {
      dataSortFilter(_dataObj, _lay, _tParObj);
    }
    // tableKey.value = tableKey.value + 1;
  };

  //table事件-汇总合计行
  const handleSummaryMethod = obj => {
    return dataSum(obj, _lay.value.fCatCol, _lay.value.layout.showSumCol);
  };

  //合并行
  const handleSpanMethod = ({ rowIndex, column }) => {
    if (_lay.value.layout.merge !== "1" && _lay.value.layout.merge !== "2" && _lay.value.sortRule.length === 0) return;
    if (_tParObj.value.merge[column.property] && _tParObj.value.merge[column.property].length > 0) {
      const merge = _tParObj.value.merge[column.property].find(item => item.rowIndex === rowIndex);
      if (merge) {
        return {
          rowspan: merge.rowspan,
          colspan: merge.colspan
        };
      }
    }
  };

  //详情信息
  const handleRowView = (row, rowIndex) => {
    refTableView.value.callInitData(_lay.value, row, rowIndex, _dataObj.value.length);
  };

  //复选框
  const handleColumnSelectable = (row, index) => {
    return !(row.$SZDRowHide === true || row["$SZDRowSelection"] === true);
  };

  //行回调事件
  const handleRowEventImp = obj => {
    emit("handleRowEvent", obj);
  };

  //上一页 下一页
  const handleNextPageImp = rowIndex => {
    handleRowView(_dataObj.value[rowIndex], rowIndex);
  };

  //行拖拽
  const dragRow = () => {
    if (_lay.value.layout.dragRow) {
      nextTick(() => {
        const tbody = document.querySelector(".drag-area .el-table__body-wrapper tbody");
        Sortable.create(tbody, {
          animation: 300,
          draggable: ".el-table__row",
          handle: ".main-drag-handle",
          onEnd: ({ newIndex, oldIndex }) => {
            if (newIndex !== oldIndex) {
              const movedItem = _dataObj.value.splice(oldIndex, 1)[0];
              _dataObj.value.splice(newIndex, 0, movedItem);
            }
          }
        });
      });
    }
  };

  //工具栏按钮-点击事件
  const handleClickToolbar = obj => {
    switch (obj.fCode) {
      case "$add":
        handleEventImp("$add", dataAdd(_dataObj, _lay.value.fCatUse));
        break;
      case "$copy":
        handleEventImp("$copy", dataCopy(_dataObj, _lay.value.fCatUse, refTable.value.getSelectionRows()));
        break;
      case "$del":
        handleEventImp("$del", dataDel(_dataObj, refTable.value.getSelectionRows()));
        break;
      case "$layout":
        // tableKey.value = tableKey.value + 1;  设置key变化，selection复选框不变化，后期需要关注20260314
        break;
      case "$filter":
        // tableKey.value = tableKey.value + 1;
        break;
      case "$refresh":
        refTable.value.clearSelection();
        tableKey.value = tableKey.value + 1;
        break;
    }
  };

  //按钮回调事件
  const handleEventImp = (fCode, obj) => {
    if (obj) {
      obj["fCode"] = fCode;
      emit("handleEvent", obj);
    }
  };

  //定义父组件可用方法
  const getRef = () => {
    return refTable.value;
  };

  //关闭详情
  const closeView = () => {
    refTableView.value.closeView();
  };

  //定义父组件可用方法
  defineExpose({
    handleClickToolbar,
    getRef,
    closeView
  });
</script>
<style scoped>
  :deep(.el-table__header) {
    width: 100% !important;
  }

  :deep(.el-table__body) {
    width: 100% !important;
  }
</style>