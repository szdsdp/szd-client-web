<template>
  <!-- 工具栏按钮 -->
  <div class="bar">
    <el-button-group>
      <template v-for="item in _lay.tBar.btns" :key="item.fCode">
        <el-dropdown v-if="item.fstHide !== true" :disabled="!item.children" @command="handleClick">
          <el-button
            :type="item.type"
            :icon="item.icon"
            :disabled="item.disabled"
            @click="handleClick(item.fCode)"
            :class="[item.fCode === '$filterFold' && btnFilterColor ? 'activeColor' : '']"
            @mouseenter="handleMouseenter($event, item)"
            @mouseleave="handleMouseleave($event, item)">
            {{ item.label }}
          </el-button>
          <!-- 二级菜单 -->
          <template #dropdown>
            <el-dropdown-menu v-if="item.children">
              <el-dropdown-item
                v-for="child in item.children"
                :icon="child.icon"
                :command="child.fCode"
                :disabled="child.disabled || child.fstHide === true">
                {{ child.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-button-group>
    <!--  布局设置  -->
    <tableLayout ref="refTableLayout" v-model:lay="_lay" @layout-ok="handleLayoutOk('$layout')" />
    <!--  排序设置  -->
    <tableLayoutSortDg ref="refTableLayoutSortDg" v-model:lay="_lay" @layout-ok="handleLayoutOk('$layout')" />
    <!--  过滤设置  -->
    <tableLayoutFilterDg ref="refTableLayoutFilterDg" v-model:lay="_lay" @layout-ok="handleLayoutOk('$filter')" />
    <!--  导出设置  -->
    <tableLayoutColumnDg ref="refTableLayoutColumnDg" :lay="_lay" @export-lay="handleExportLay" />
    <!--  统计分析 -->
    <statistics ref="refStatistics" />
    <!--  上传Excel插件 -->
    <div style="display: none">
      <el-upload ref="uploadExcel" action :show-file-list="false" :auto-upload="false" accept=".xls,.xlsx" :on-change="handleUploadExcel">
        <el-icon ref="uploadExcelBtn" />
      </el-upload>
    </div>
    <!--  文字提示 -->
    <Teleport to="body">
      <span class="tooltipText" id="jTip" />
    </Teleport>
  </div>
</template>

<script setup>
  import "./css/tableToolbar.scss";
  import { ref, computed } from "vue";
  import { $m } from "../../common/utils/globalConfig";
  import tableLayout from "./layout/tableLayout.vue";
  import tableLayoutSortDg from "./layout/tableLayoutSortDg.vue";
  import tableLayoutFilterDg from "./layout/tableLayoutFilterDg.vue";
  import tableLayoutColumnDg from "./layout/tableLayoutColumnDg.vue";
  import statistics from "../tableStats/statistics.vue";
  import { excelExport, excelTmpExport, excelUpload } from "./js/TableExcel";

  //回调事件
  const emit = defineEmits(["update:lay", "update:dataObj", "clickToolbar"]);
  const props = defineProps({
    lay: {
      type: Object
    },
    //输出数据
    dataObj: {
      type: Array,
      default: []
    },
    //回调方法
    callMethod: {
      type: Function,
      default: undefined
    }
  });
  //子屏幕ref
  const refTableLayout = ref(); //布局屏幕
  const refTableLayoutSortDg = ref(); //排序屏幕
  const refTableLayoutFilterDg = ref(); //过滤屏幕
  const refTableLayoutColumnDg = ref(); //导出列屏幕
  const refStatistics = ref(); //统计分析
  const uploadExcel = ref(); //上传Excel组件
  const uploadExcelBtn = ref(); //上传Excel组件中按钮
  //同步更改的参数-布局
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
  //过滤按钮颜色
  const btnFilterColor = ref(Object.keys(_lay.value.fRanges).length > 0);
  //按钮回调事件
  const handleClick = fCode => {
    switch (fCode) {
      case "$sort":
        refTableLayoutSortDg.value.callInitData(); //表格布局-弹出界面
        break;
      case "$sortCancel":
        if (_lay.value.sortRule.length > 0) {
          _lay.value.sortRule = [];
          handleLayoutOk("$layout");
        }
        break;
      case "$filter":
        refTableLayoutFilterDg.value.callInitData(); //表格布局-弹出界面
        break;
      case "$filterCancel":
        if (Object.keys(_lay.value.fRanges).length > 0) {
          _lay.value.fRanges = {};
          handleLayoutOk("$filter");
        }
        break;
      case "$template":
        excelTmpExport(_lay.value);
        break;
      case "$export":
        excelExport(_lay.value, _dataObj.value);
        break;
      case "$exportLay":
        refTableLayoutColumnDg.value.callInitData(); //表格布局-弹出界面
        break;
      case "$upload":
        uploadExcelBtn.value.$el.click();
        break;
      case "$layout":
        refTableLayout.value.callInitData(); //表格布局-弹出界面
        break;
      case "$statistics":
        callStatistics();
        break;
      default:
        emit("clickToolbar", { fCode: fCode });
        break;
    }
  };

  //表格布局-弹出界面-回调
  const handleLayoutOk = fCode => {
    setBtnFilterColor();
    emit("clickToolbar", { fCode: fCode });
  };
  //设置过滤按钮颜色
  const setBtnFilterColor = () => {
    btnFilterColor.value = Object.keys(_lay.value.fRanges).length > 0;
  };
  //导出数据
  const handleExportLay = async obj => {
    if (_lay.value.layout.exportExcelMode === "1") {
      emit("clickToolbar", { fCode: "$exportLay", btnFlag: obj.btnFlag, expLay: obj.expLay });
    } else if (_lay.value.layout.exportExcelMode === "2") {
      if (obj.btnFlag === "B") {
        excelExport(obj.expLay.lay, _dataObj.value);
      } else {
        if (props.callMethod) {
          const _expResult = await props.callMethod({ fCode: "$exportLay", expLay: obj.expLay });
          if (Array.isArray(_expResult) && _expResult.length > 0) {
            excelExport(obj.expLay.lay, _expResult);
          } else {
            $m("CORE_CLIENT.W011"); //无需要导出的数据
          }
        } else {
          $m("CORE_CLIENT.E118"); //高级表格未绑定callMethod属性值方法
        }
      }
    } else {
      excelExport(obj.expLay.lay, _dataObj.value);
    }
  };
  //上传数据
  const handleUploadExcel = file => {
    const rowIndex = _dataObj.value.length;
    excelUpload(_lay.value, _dataObj.value, file).then(res => {
      if (res) {
        emit("clickToolbar", { fCode: "$upload", rowIndex: rowIndex });
      }
    });
    uploadExcel.value.clearFiles();
  };
  //统计分析
  const callStatistics = () => {
    let _stData = [];
    for (let i = 0; i < _dataObj.value.length; i++) {
      if (_dataObj.value[i]["$SZDRowHide"] === true) continue; //隐藏行不计算
      _stData.push(_dataObj.value[i]);
    }
    if (_stData.length === 0) {
      $m("CORE_CLIENT.W113"); //无需处理的数据
    } else {
      refStatistics.value.create({ layout: _lay.value.layout, fieldCat: _lay.value.fCatCol, data: _stData });
    }
  };

  //鼠标事件-显示
  const handleMouseenter = (e, butItem) => {
    if (!butItem.tip) return;
    const tip = document.querySelector("#jTip");
    if (tip) {
      tip.innerText = butItem.tip;
      const h = tip.offsetHeight + 5;
      const w = tip.offsetWidth;
      const pos = e.target.getBoundingClientRect();
      tip.style.cssText = `display:block;top:${pos.y - h}px;left:${pos.x + (pos.width - w) / 2}px;`;
    }
  };
  //鼠标事件-离开
  const handleMouseleave = (e, butItem) => {
    const tip = document.querySelector("#jTip");
    if (tip) {
      tip.style.cssText = "left:-1000px";
    }
  };
</script>

<style lang="scss" scoped>
  :deep(.el-button-group .el-dropdown) > .el-button {
    border-radius: 0;
  }

  :deep(.el-button-group .el-dropdown:first-child) > .el-button {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  :deep(.el-button-group .el-dropdown:last-child) > .el-button {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  :deep(.el-button-group .el-dropdown:not(:last-child)) {
    margin-right: -1px;
  }

  .el-button-group .el-dropdown > .el-button {
    float: left;
    position: relative;
  }

  :focus {
    outline: 0;
  }

  .el-button--primary {
    background-color: #409eff;
    border-color: #409eff;
    color: #fff;
  }

  .el-button--primary:hover {
    background-color: #66b1ff;
    border-color: #66b1ff;
    color: #fff;
  }

  .el-button--primary.is-active,
  .el-button--primary:active {
    background-color: #3a8ee6;
    border-color: #3a8ee6;
    color: #fff;
  }

  .activeColor {
    color: #0af439e0;
  }

  .tooltipText {
    //display: none;
    border: 1px solid #dcdfe6;
    background-color: white;
    color: #333;
    text-align: center;
    border-radius: 3px;
    padding: 5px 10px;
    position: fixed;
    z-index: 10000;
    left: -1000px;
    font-size: 12px;

    &::before,
    &::after {
      content: " ";
      position: absolute;
      top: 100%;
      left: 50%;
      border-style: solid;
    }

    &::before {
      margin-left: -5px;
      border-width: 5px;
      border-color: #dcdfe6 transparent transparent transparent;
    }

    &::after {
      margin-left: -4px;
      border-width: 4px;
      border-color: #ffffff transparent transparent transparent;
    }
  }
</style>
