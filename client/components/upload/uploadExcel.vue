<template>
  <!-- Excel前端导入组件 -->
  <el-dialog
    :title="$t(uploadParams.title)"
    v-model="dg.open"
    append-to-body
    class="app-dialog-container"
    @close="handleClose"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="[uploadParams.dialogWidth, uploadParams.dialogHeight]" />
    <el-upload ref="refUploadExcel" accept=".xls,.xlsx" action="" :auto-upload="false" :disabled="dg.disabled" @change="handleChange" drag>
      <!-- 拖拽导入 -->
      <div>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          {{ $t("将文件拖到此处，或") }} <em>{{ $t("点击上传") }}</em>
        </div>
        <!-- 导入文件提示信息 -->
        <div v-if="uploadParams.acceptTxt" class="el-upload__tip" style="color: red">
          {{ uploadParams.acceptTxt }}
        </div>
      </div>
    </el-upload>

    <template #footer>
      <szd-button label="下载模板" type="primary" @click="handleDownloadTM" />
      <szd-button label="取消" type="primary" @click="handleCloseForm" />
    </template>

    <!-- 展示Excel -->
    <uploadExcelShow ref="refUploadExcelShow" :uploadParams="uploadParams" :fCats="_fCats" @showOkay="handleShowOkay" @showCancel="handleCloseForm" />
  </el-dialog>
</template>

<script setup>
  import { onMounted, ref } from "vue";
  import _ from "lodash";
  import { $t } from "../../common/utils/globalConfig";
  import szdExcel from "../../common/tools/excel";
  import uploadExcelShow from "./uploadExcelShow.vue";

  const props = defineProps({
    updParams: {
      type: Object,
      default: {}
    },
    fCats: {
      type: Object,
      default: []
    },
    sheets: {
      type: Array,
      default: []
    }
  });

  const emit = defineEmits(["uploadResult", "closeDialog"]);
  //上传文件控件
  const refUploadExcel = ref();
  const refUploadExcelShow = ref();

  //窗口对象
  const dg = ref({
    open: false,
    disabled: false
  });
  //Excel列字段
  const _fCats = ref([]);

  //上传参数
  const uploadParams = ref({
    acceptTxt: "", //提示信息
    TMCode: "", //下载模板
    fileName: "", //文件名
    title: "导入数据", //标题
    dialogWidth: 300, //窗口宽度
    dialogHeight: 300, //窗口高度
    showData: false //显示数据
  });

  onMounted(() => {
    initUploadParam(props.updParams);
  });

  //初始化上传参数
  const initUploadParam = infoParam => {
    initData();
    if (infoParam.acceptTxt) uploadParams.value.acceptTxt = infoParam.acceptTxt;
    if (infoParam.TMCode) uploadParams.value.TMCode = infoParam.TMCode;
    if (infoParam.fileName) uploadParams.value.fileName = infoParam.fileName;
    if (infoParam.title) uploadParams.value.title = infoParam.title;
    if (infoParam.dialogWidth && infoParam.dialogWidth > 10) uploadParams.value.dialogWidth = infoParam.dialogWidth;
    if (infoParam.dialogHeight && infoParam.dialogHeight > 10) uploadParams.value.dialogHeight = infoParam.dialogHeight;
    if (infoParam.showData) uploadParams.value.showData = infoParam.showData;
    if (infoParam.showIndex) uploadParams.value.showIndex = infoParam.showIndex;
    //获取导入列字段
    _fCats.value = getExcelFCols(_.cloneDeep(props.fCats));
    dg.value.open = true;
  };

  //生成输出的表头
  const getExcelFCols = fCats => {
    let cols = [];
    if (!fCats || fCats.length === 0) return cols;
    for (let i = 0; i < fCats.length; i++) {
      const fCat = fCats[i];
      if (fCat.hide || ["button", "sub-table", "svg"].includes(fCat.type)) continue;
      let col = _.cloneDeep(fCat);
      if (col.children && col.children.length > 0) {
        let _children = getExcelFCols(col.children);
        if (_children && _children.length > 0) {
          col.children = _children;
          cols.push(col);
        }
      } else {
        cols.push(col);
      }
    }
    return cols;
  };

  //下载模版
  const handleDownloadTM = () => {
    szdExcel.exportTemplate(_fCats.value, uploadParams.value.TMCode, uploadParams.value.fileName, props.sheets);
  };

  //上传文件
  const handleChange = (file, files) => {
    let rows = [];
    dg.value.disabled = true;
    szdExcel.uploadData(_fCats.value, rows, file).then(res => {
      if (res) {
        if (uploadParams.value.showData && rows && rows.length > 0) {
          refUploadExcelShow.value.callShowImpExcelData(rows);
        } else {
          if (rows && rows.length > 0) emit("uploadResult", rows);
          dg.value.open = false;
        }
      } else {
        dg.value.open = false;
      }
    });
  };

  //展示确认
  const handleShowOkay = rows => {
    dg.value.open = false;
    if (rows && rows.length > 0) emit("uploadResult", rows);
  };

  //初始化数据
  const initData = () => {
    dg.value.disabled = false;
    uploadParams.value = {
      acceptTxt: "", //提示信息
      TMCode: "", //下载模板
      fileName: "", //文件名
      title: "导入数据", //标题
      dialogWidth: 300, //窗口宽度
      dialogHeight: 300, //窗口高度
      showData: false, //显示数据
      showIndex: false //显示行号
    };
    _fCats.value = [];
  };

  const handleCloseForm = () => {
    dg.value.open = false;
  };

  const handleClose = () => {
    refUploadExcel.value.clearFiles();
    emit("closeDialog");
  };
</script>