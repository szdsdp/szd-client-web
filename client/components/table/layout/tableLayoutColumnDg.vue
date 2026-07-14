<template>
  <!-- 导出列设置 -->
  <el-dialog
    :title="$t('导出设置')"
    v-model="dg.open"
    append-to-body
    @close="handleClose"
    class="app-dialog-container"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="[800, 600]" />
    <!-- 导出第几页 -->
    <template v-if="_lay.layout.exportExcelMode !== '0'">
      <div class="main-table-title">
        <div class="main-table-title-left" style="width: 100%; height: 28px">
          <span>{{ $t("点击[ 无分页下载 ]时生效，当导出内容多时，请通过分页下载。") }}</span>
        </div>
      </div>
      <el-form class="app-el-form" style="margin-bottom: 5px">
        <el-row>
          <szd-input-number-form-item-col v-model="expPage.pageNum" label="第几页" :min="1" :span="12" />
          <szd-input-number-form-item-col v-model="expPage.pageSize" label="导出页大小" :min="10000" :span="12" />
        </el-row>
      </el-form>
    </template>
    <!-- 显示的列 -->
    <tableLayoutColumn ref="refTableLayoutColumn" :expLay="true" :lay="_lay" v-model:colCat="colCat" />

    <template #footer>
      <el-button v-if="_lay.layout.exportExcelMode !== '0'" type="primary" @click="handleConfirm('A')">
        {{ $t("无分页下载") }}
      </el-button>
      <el-button type="primary" @click="handleConfirm('B')"> {{ $t("当前页下载") }}</el-button>
      <el-button type="primary" @click="handleClose"> {{ $t("关闭") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed, ref } from "vue";
  import { $t } from "../../../common/utils/globalConfig";
  import tableLayoutColumn from "./tableLayoutColumn.vue";
  import { initDataLayout, setSelData } from "../js/tableLayout";
  //回调事件
  const emit = defineEmits(["export-lay"]);
  const props = defineProps({
    lay: {
      type: Object
    }
  });
  //窗口对象
  const dg = ref({
    open: false
  });
  //同步更改的参数-布局
  const _lay = computed(() => {
    return _.cloneDeep(props.lay);
  });
  //列字段
  const colCat = ref([]);
  //排序规则
  const sortObj = ref({
    cats: [], //排序字段
    rule: [] //排序规则
  });
  //过滤规则
  const filterObj = ref({
    catsAll: [], //全部字段
    catsSel: [], //已选字段
    fRanges: {}
  });
  //导出第几页
  const expPage = ref({
    pageNum: 1,
    pageSize: 10000
  });

  //初始化数据
  const callInitData = () => {
    //初始化数据-Layout
    initDataLayout(_lay, colCat, sortObj, filterObj);
    let _colCat = [];
    for (let i = 0; i < colCat.value.length; i++) {
      if (!["button", "sub-table", "svg"].includes(colCat.value[i].type)) _colCat.push(colCat.value[i]);
    }
    colCat.value = _colCat;
    //打开窗口
    dg.value.open = true;
  };

  //应用布局
  const handleConfirm = btnFlag => {
    //选择数据赋值
    setSelData(_lay, colCat.value, sortObj.value.rule, filterObj.value.fRanges);
    //回调
    emit("export-lay", { btnFlag: btnFlag, expLay: { page: expPage.value, lay: _lay.value, cols: colCat.value } });
    handleClose();
  };

  //关闭窗口
  const handleClose = () => {
    dg.value.open = false;
  };

  //定义父组件可以调用方法
  defineExpose({
    callInitData
  });
</script>
