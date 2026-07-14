<template>
  <el-dialog
    :title="$t(dg.title)"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
    class="app-dialog-container"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="[1200, 600]" />
    <!-- 走马灯 -->
    <el-carousel
      v-if="fileList.length > 1"
      :initial-index="dg.index"
      trigger="click"
      :autoplay="false"
      :loop="false"
      indicator-position="outside"
      @change="handleChangeCarousel"
      class="l-el-carousel">
      <el-carousel-item v-for="(item, index) in fileList" :key="'item_' + index">
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%">
          <szd-file-view v-if="item.src" :src="item.src" :fileName="item.fileName" :key="'file_' + index" />
        </div>
      </el-carousel-item>
    </el-carousel>
    <!-- 单个文件 -->
    <szd-file-view v-else :src="_fileObj.src" :fileName="_fileObj.fileName" />

    <template #footer>
      <szd-button v-if="download" label="下载" type="primary" @click="handleDownload" />
      <szd-button label="关闭" type="primary" @click="handleCloseForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { $t } from "../../common/utils/globalConfig";
  import szdFile from "../../common/tools/fileTool";
  //定义事件
  const emit = defineEmits(["closeForm"]);

  const props = defineProps({
    fileList: {
      type: Array
    },
    fileIndex: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: "查看文件"
    },
    download: {
      type: Boolean,
      default: true
    }
  });

  //功能参数
  const dg = ref({
    open: false,
    title: "查看文件",
    index: 0
  });
  const _fileList = ref([]);
  const _fileObj = ref();

  onMounted(() => {
    setFileList();
    dg.value.open = true;
    dg.value.title = props.title || "查看文件";
  });

  //设置文件列表
  const setFileList = () => {
    _fileList.value = [];
    for (let i = 0; i < props.fileList.length; i++) {
      const item = props.fileList[i];
      _fileList.value.push({ src: item.src, fileName: item.fileName });
    }
    handleChangeCarousel(props.fileIndex, 0);
  };

  //当前显示的文件
  const handleChangeCarousel = (current, prev) => {
    dg.value.index = current;
    _fileObj.value = { src: "", fileName: "" };
    if (dg.value.index < 0) dg.value.index = 0;
    if (dg.value.index >= props.fileList.length) dg.value.index = _fileList.value.length - 1;
    _fileObj.value = _fileList.value[dg.value.index];
  };

  //下载文件
  const handleDownload = () => {
    szdFile.downloadFile(_fileObj.value.src, _fileObj.value.fileName);
  };

  const handleCloseForm = () => {
    dg.value.open = false;
  };

  const handleClose = () => {
    emit("closeForm");
  };
</script>
<style lang="scss" scoped>
  .l-el-carousel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    :deep(.el-carousel__container) {
      height: 100%;
    }

    :deep(.el-carousel__arrow) {
      background: #606266;
      font-size: 20px;
    }

    :deep(.el-carousel__indicators--horizontal) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    :deep(.el-carousel__indicator--horizontal) {
      padding: 15px 10px 0 10px;
    }

    :deep(.el-carousel__button) {
      background: #1890ff;
    }
  }
</style>
