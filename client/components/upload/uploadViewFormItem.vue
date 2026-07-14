<template>
  <!-- 标签在左边 -->
  <div v-if="!_fst.hide && _label && labelAlign === 'left'" class="l-upload-view-left">
    <div class="l-label" :style="{ width: labelWidth }">
      <div class="main-form-label">
        <span v-if="_fst.required" class="main-required">*</span>
        <span>{{ _label }}</span>
        <el-icon v-if="helpTip" class="main-help-tip">
          <QuestionFilled @click.prevent.stop="handleHelpTip" />
        </el-icon>
      </div>
      <div v-if="zip && _modelValue">
        <szd-button label="打包下载" type="primary" icon="Download" link @click="handleDownload" style="padding: 7px 0" />
      </div>
    </div>
    <szd-upload-view
      ref="refUploadView"
      v-bind="$attrs"
      v-model="_modelValue"
      v-model:fileCount="_fileCount"
      :showDelete="showDelete"
      :szdfst="szdfst"
      @preview="handlePreview" />
  </div>
  <!-- 标签在上边 -->
  <div v-else-if="!_fst.hide && _label && labelAlign.startsWith('top')" class="l-upload-view-top-bottom">
    <div class="l-label" :style="handleStyleLabel()">
      <span v-if="_fst.required" class="main-required">*</span>
      <span>{{ _label }}</span>
      <el-icon v-if="helpTip" class="main-help-tip">
        <QuestionFilled @click.prevent.stop="handleHelpTip" />
      </el-icon>
    </div>
    <szd-upload-view
      ref="refUploadView"
      v-bind="$attrs"
      v-model="_modelValue"
      v-model:fileCount="_fileCount"
      :showDelete="showDelete"
      :szdfst="szdfst"
      @preview="handlePreview" />
  </div>
  <!-- 标签在底部 -->
  <div v-else-if="!_fst.hide && _label && labelAlign.startsWith('bottom')" class="l-upload-view-top-bottom">
    <szd-upload-view
      v-bind="$attrs"
      v-model="_modelValue"
      v-model:fileCount="_fileCount"
      :showDelete="showDelete"
      :szdfst="szdfst"
      @preview="handlePreview" />
    <div class="l-label" :style="handleStyleLabel">
      <span v-if="_fst.required" class="main-required">*</span>
      <span>{{ _label }}</span>
      <el-icon v-if="helpTip" class="main-help-tip">
        <QuestionFilled @click.prevent.stop="handleHelpTip" />
      </el-icon>
    </div>
  </div>
  <!-- 无标签 -->
  <div v-else-if="!_fst.hide" class="l-upload-view-no-label">
    <szd-upload-view
      ref="refUploadView"
      v-bind="$attrs"
      v-model="_modelValue"
      v-model:fileCount="_fileCount"
      :showDelete="showDelete"
      :szdfst="szdfst"
      @preview="handlePreview" />
  </div>
</template>

<script setup>
  import { computed, ref } from "vue";
  import { $mW, $t } from "../../common/utils/globalConfig";
  import szdTool from "../../common/tools/tool";
  import szdComp from "../../common/utils/component";
  import szdFile from "../../common/tools/fileTool";

  const props = defineProps({
    modelValue: {
      type: String
    },
    //文件数量
    fileCount: {
      type: Number,
      default: 0
    },
    //显示删除文件
    showDelete: {
      type: Boolean,
      default: false
    },
    szdfst: {
      type: String,
      default: ""
    },
    //标题位置 left top-left top-center top-right bottom-left bottom-center bottom-right
    labelAlign: {
      type: String,
      default: "left"
    },
    //打包下载
    zip: {
      type: Boolean,
      default: false
    },
    //form-item所需的参数
    label: {
      type: String,
      default: ""
    },
    labelWidth: {
      type: String,
      default: "25%"
    },
    required: {
      type: Boolean,
      default: false
    },
    helpTip: {
      type: String
    }
  });
  //定义事件
  const emit = defineEmits(["update:modelValue", "update:fileCount", "preview"]);
  const refUploadView = ref();
  //值数据
  const _modelValue = computed({
    get: () => props.modelValue,
    set: val => {
      emit("update:modelValue", val);
    }
  });
  //文件数量
  const _fileCount = computed({
    get: () => props.fileCount,
    set: val => {
      emit("update:fileCount", val);
    }
  });
  //编辑状态
  const _fst = computed(() => {
    return szdComp.getCompFstForm(props.szdfst, props.required);
  });
  const _label = computed(() => {
    return $t(props.label);
  });
  //显示文字帮助事件
  const handleHelpTip = () => {
    szdTool.helpDoc(props.helpTip);
  };
  //打包下载文件
  const handleDownload = () => {
    if (_modelValue.value && refUploadView.value.getFileList().length > 0) {
      szdFile.downloadFileZip(_modelValue.value, props.showDelete);
    } else {
      $mW("不存在需要下载的文件");
    }
  };
  //标签样式
  const handleStyleLabel = () => {
    let _labelStyle = {};
    if (props.labelAlign.includes("center")) {
      _labelStyle["justify-content"] = "center";
    } else if (props.labelAlign.includes("right")) {
      _labelStyle["justify-content"] = "flex-end";
    } else if (props.labelAlign.includes("left")) {
      _labelStyle["justify-content"] = "flex-start";
    }
    return _labelStyle;
  };

  //预览
  const handlePreview = obj => {
    emit("preview", obj);
  };

  //获取文件数量-未删除
  const getFileCount = () => {
    return refUploadView.value.getFileCount();
  };

  //获取文件列表
  const getFileList = () => {
    return refUploadView.value.getFileList();
  };

  defineExpose({
    getFileCount,
    getFileList
  });
</script>

<style lang="scss" scoped>
  .l-upload-view-left {
    display: flex;
    box-sizing: border-box;
    //标签
    .l-label {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
      font-size: $fz;
      font-weight: 600;
      color: #606266;
      background-color: #eef1f6;
      padding-top: 0;
      padding-left: 5px;
      padding-right: 6px;
    }
  }

  .l-upload-view-top-bottom {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .l-label {
      display: flex;
      font-size: $fz;
      font-weight: 600;
      color: #606266;
      padding-top: 0;
      justify-content: center;
      padding-right: 15px;
      align-items: center;
      padding-left: 5px;
    }
  }

  .l-upload-view-no-label {
    display: flex;
    box-sizing: border-box;
  }
</style>