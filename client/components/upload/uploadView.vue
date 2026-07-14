<template>
  <!-- 上传、预览、删除区域 -->
  <div v-if="!_fst.hide && _listType" class="l-upload-container" :style="{ '--card-w': cardWidth + 'px', '--card-h': cardHeight + 'px' }">
    <el-upload
      ref="refUpload"
      v-model:file-list="fileList"
      :list-type="_listType"
      action=""
      :auto-upload="false"
      :multiple="uploadParams.multiple"
      :limit="uploadParams.limit"
      :accept="uploadParams.accept"
      :drag="props.listType !== 'button' && !_fst.disabled"
      :disabled="_fst.disabled"
      @change="handleChange"
      @exceed="handleExceed"
      class="l-upload-comp"
      :style="{ 'text-align': props.listType === 'button' ? 'center' : '' }"
      :class="handleClassUpload()">
      <!-- 卡片 -->
      <el-icon v-if="_listType === 'picture-card'" :size="28">
        <Plus />
      </el-icon>
      <!-- 按钮 -->
      <div v-else-if="props.listType === 'button'" class="link-type" style="display: flex; justify-content: center">
        <el-icon :size="22">
          <upload-filled />
        </el-icon>
        <div style="display: flex; align-items: center; padding-left: 2px; word-break: keep-all">
          {{ $t("上传") }}
        </div>
      </div>
      <!-- 拖拽 -->
      <div v-else style="display: flex; justify-content: center">
        <el-icon :size="22" color="#a8abb2">
          <upload-filled />
        </el-icon>
        <div class="el-upload__text" style="padding-left: 5px">
          {{ $t("将文件拖到此处，或") }} <em>{{ $t("点击上传") }}</em>
        </div>
      </div>
      <!-- 提示信息 -->
      <div v-if="uploadParams.acceptTxt" class="l-upload-tap">{{ uploadParams.acceptTxt }}</div>
      <!-- 显示文件 -->
      <template #file="{ file }">
        <template v-if="_listType === 'text'">
          <span class="l-text-info pointer" @click="handlePreview(file)">
            <el-icon> <Document /> </el-icon>
            <span style="padding-left: 2px" :class="file.fileDel ? 'l-text-del-line' : ''">{{ file.name }}</span>
          </span>
          <span style="display: flex; align-items: center">
            <el-icon v-if="download" @click="handleDownload(file)" class="el-icon--close pointer" style="font-size: 18px; margin-right: 20px">
              <Download />
            </el-icon>
            <el-icon v-if="!_fst.disabled" @click="handleCallEdit(file)" class="el-icon--close pointer" style="font-size: 18px">
              <Edit />
            </el-icon>
          </span>
        </template>
        <template v-else-if="_listType === 'picture'">
          <span class="l-text-info pointer" @click="handlePreview(file)">
            <img v-if="file.raw.type.startsWith('image/')" :src="file.url" class="el-upload-list__item-thumbnail" style="width: 65px" />
            <img v-else :src="handleShowIcon(file.name)" class="el-upload-list__item-thumbnail" style="width: 65px" />
            <div class="l-text-info-picture" :class="file.fileDel ? 'l-text-del-line' : ''">
              <div>
                <label>{{ $t("文件名") }}：</label> <span>{{ file.name }}</span>
              </div>
              <div>
                <label>{{ $t("上传人") }}：</label> <span>{{ file.uploadByName }}</span>
                <label style="margin-left: 10px">{{ $t("上传时间") }}：</label> <span>{{ file.uploadTime }}</span>
              </div>
            </div>
          </span>
          <span style="display: flex; align-items: center">
            <el-icon v-if="download" @click="handleDownload(file)" class="el-icon--close pointer" style="font-size: 18px; margin-right: 20px">
              <Download />
            </el-icon>
            <el-icon v-if="!_fst.disabled" @click="handleCallEdit(file)" class="el-icon--close pointer" style="font-size: 18px">
              <Edit />
            </el-icon>
          </span>
        </template>
        <template v-else-if="_listType === 'picture-card'">
          <div class="l-img-picture-card">
            <div v-if="file.fileDel" class="l-img-del">DELETED</div>
            <img v-if="file.raw.type.startsWith('image/')" :src="file.url" class="el-upload-list__item-thumbnail" />
            <div v-else style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%">
              <img :src="handleShowIcon(file.name)" class="el-upload-list__item-thumbnail" style="width: 75%" />
            </div>
          </div>
          <!-- 图片上按钮 -->
          <span class="el-upload-list__item-actions">
            <span class="el-upload-list__item-preview" @click="handlePreview(file)">
              <el-icon class="pointer"><ZoomIn /></el-icon>
            </span>
            <span v-if="download" class="el-upload-list__item-preview" @click="handleDownload(file)">
              <el-icon class="pointer"><Download /></el-icon>
            </span>
            <span v-if="!_fst.disabled" class="el-upload-list__item-delete" @click="handleCallEdit(file)">
              <el-icon class="pointer"><Edit /></el-icon>
            </span>
          </span>
        </template>
        <!-- 进度条 -->
        <div v-if="file.uid && fileProgress[file.uid] && fileProgress[file.uid] > 0 && fileProgress[file.uid] < 100" class="l-progress-percentage">
          <el-progress :percentage="fileProgress[file.uid]" :stroke-width="4" :show-text="true" />
        </div>
      </template>
    </el-upload>
    <uploadViewEdit ref="refUploadViewEdit" @updFile="handleUpdFile" />
  </div>
</template>

<script setup>
  import { computed, nextTick, onMounted, ref, watch } from "vue";
  import _ from "lodash";
  import Compressor from "compressorjs";
  import { $m, $mE, $mS, $mW, $t } from "../../common/utils/globalConfig";
  import { getUploadViewList, updUploadViewFileBuss, updUploadViewFileById } from "../api/upload";
  import { requestUploadFile } from "../../common/utils/requestUpload";
  import { szdFileView } from "../fileView/fileView";
  import szdFile from "../../common/tools/fileTool";
  import szdComp from "../../common/utils/component";
  import uploadViewEdit from "./uploadViewEdit";

  const props = defineProps({
    //文件对象号
    modelValue: {
      type: String
    },
    //文件数量
    fileCount: {
      type: Number,
      default: 0
    },
    //文件类别、文件根目录
    fileCate: {
      type: String,
      default: ""
    },
    //根文件后文件路径
    filePath: {
      type: String,
      default: ""
    },
    //文件列表的类型
    listType: {
      type: String,
      default: "text"
    },
    //最大上传文件数
    limit: {
      type: Number,
      default: 100
    },
    //文件大小-KB
    fileSize: {
      type: Number
    },
    //上传文件类型 ".xls,.xlsx"
    accept: {
      type: String
    },
    //提示信息
    acceptTxt: {
      type: String,
      default: ""
    },
    //文件后缀
    extensions: {
      type: Array,
      default: []
    },
    //检查文件重复
    checkRepeat: {
      type: Boolean,
      default: true
    },
    //支持下载
    download: {
      type: Boolean,
      default: true
    },
    //尺寸[宽-最小，宽-最大，高-最小，高-最大]
    dimension: {
      type: Array,
      default: []
    },
    //压缩图片 { compress: false, //是否压缩 fileSize: 1024, //超过多大进行压缩KB quality: 0.8, //压缩质量 widthMax: 1600, //压缩最大宽度 widthMin: 100 //压缩最小宽度 }
    compress: {
      type: Object,
      default: {
        compress: false, //是否压缩
        fileSize: 1024, //超过多大进行压缩KB
        quality: 0.8, //压缩质量
        widthMax: 1600, //压缩最大宽度
        widthMin: 100 //压缩最小宽度
      }
    },
    //卡片大小-宽
    cardWidth: {
      type: Number,
      default: 130
    },
    //卡片大小-高
    cardHeight: {
      type: Number,
      default: 130
    },
    //预览方式 A-单文件预览 B-多文件预览 C-客户化预览
    previewType: {
      type: String,
      default: "B"
    },
    //显示删除文件
    showDelete: {
      type: Boolean,
      default: false
    },
    //业务Id
    bussId: {
      type: String,
      default: ""
    },
    //业务单号
    bussDocId: {
      type: String,
      default: ""
    },
    //水印标记 { content: 内容,fontSize: 字号,fontColor:"#000000"字体颜色, opacity: 0.8透明度,angle: 30旋转角度,position: bottom-left水印位置水印位置top-left|top-center|top-right|center|bottom-left|bottom-center|bottom-right }
    watermark: {
      type: Object
    },
    disabled: {
      type: Boolean,
      default: false
    },
    szdfst: {
      type: String
    },
    szdopt: {
      type: String
    }
  });
  //定义事件
  const emit = defineEmits(["update:modelValue", "update:fileCount", "preview"]);
  const refUploadViewEdit = ref();
  //值数据
  const _modelValue = ref();
  //编辑状态
  const _fst = computed(() => {
    return szdComp.getCompFst(props.szdfst, props.szdopt, props.disabled);
  });
  const _listType = computed(() => {
    return ["text", "picture", "picture-card"].includes(props.listType) ? props.listType : "text";
  });
  //卡片图标
  const fileTypeIcon = szdFile.getFileTypeIcon();
  //上传参数
  const uploadParams = ref({});
  //上传文件控件
  const refUpload = ref();
  //上传文件清单
  const fileList = ref([]);
  const fileProgress = ref({ uid: 0 });
  const fileRepeat = ref();

  //监听值数据
  watch(
    () => props.modelValue,
    () => {
      _modelValue.value = props.modelValue;
      nextTick(() => {
        getUploadViewListInfo();
      });
    },
    { immediate: true }
  );

  onMounted(() => {
    initUploadParam();
  });

  //获取文件清单
  const getUploadViewListInfo = () => {
    fileRepeat.value = [];
    if (!_modelValue.value) {
      updateFileCount(); //更新文件数量
      return;
    }
    fileList.value = [];
    getUploadViewList(_modelValue.value, props.showDelete).then(res => {
      if (res.code === 200) {
        for (let i = 0; i < res.data.length; i++) {
          let item = res.data[i];
          item["name"] = item.fileName;
          item["url"] = item.fileUrl;
          item["uid"] = item.fileId;
          item["status"] = "success";
          item["raw"] = { name: item.fileName, type: szdFile.getFileMimeType(item.fileName) };
          if (item.fileUrlThumb) {
            item.url = item.fileUrlThumb;
            item.raw.type = szdFile.getFileMimeType(item.fileThumbExt);
          }
          fileList.value.push(item);
          fileRepeat.value.push(item.fileName);
        }
        //更新业务单号
        updateBussDoc();
        //更新文件数量
        updateFileCount();
      }
    });
  };

  //更新业务单号
  const updateBussDoc = () => {
    if ((!props.bussId && !props.bussDocId) || fileList.value.length === 0) return;
    const _index = fileList.value.findIndex(r => r.bussId !== props.bussId || r.bussDocId !== props.bussDocId);
    if (_index > -1) {
      updUploadViewFileBuss({ fileObjId: _modelValue.value, bussId: props.bussId, bussDocId: props.bussDocId }).then();
    }
  };

  //文件上传
  const submitForm = (file, compressedFile) => {
    let _uploadObj = {
      fileObjId: _modelValue.value,
      fileCate: props.fileCate,
      filePath: props.filePath,
      bussId: props.bussId,
      bussDocId: props.bussDocId,
      watermark: props.watermark
    };
    const formData = new FormData();
    formData.append("param", JSON.stringify(_uploadObj));
    formData.append("file", compressedFile ? compressedFile : file.raw, file.name);
    fileProgress.value[file.uid] = 0;
    requestUploadFile(uploadParams.value.uploadUrl, formData, progress => handleProgress(progress, file))
      .then(res => {
        delete fileProgress.value[file.uid];
        if (res.code === 200) {
          if (res.data.fileId && res.data.fileObjId) {
            $mS("文件上传完成");
            if (_modelValue.value !== res.data.fileObjId) {
              _modelValue.value = res.data.fileObjId;
              emit("update:modelValue", res.data.fileObjId);
            }
            file.fileObjId = res.data.fileObjId;
            file.fileId = res.data.fileId;
            file.uid = res.data.fileId;
            file.fileName = res.data.fileName;
            file.fileUrl = res.data.fileUrl;
            file.fileUrlThumb = res.data.fileUrlThumb;
            file.fileThumbExt = res.data.fileThumbExt;
            file.fileDel = res.data.fileDel;
            file.uploadBy = res.data.uploadBy;
            file.uploadByName = res.data.uploadByName;
            file.uploadTime = res.data.uploadTime;
            fileRepeat.value.push(file.fileName);
            //更新文件数量
            updateFileCount();
          } else {
            $mE(["文件上传失败", res.msg]);
          }
        } else {
          $mE(["文件上传失败", res.msg]);
        }
      })
      .catch(err => {
        $mE(`上传文件失败${file.name}`);
        console.error("上传失败：", err);
      });
  };

  //文件上传进度
  const handleProgress = (progress, file) => {
    fileProgress.value[file.uid] = progress.percent;
  };

  //检查文件和调整为上传
  const handleChange = (file, files) => {
    if (!file.url) file.url = URL.createObjectURL(file.raw);
    const _filesLen = files.length - 1;
    //检查文件名是否重复
    if (props.checkRepeat && fileRepeat.value.includes(file.name)) {
      $mW("存在相同的文件名");
      files.splice(_filesLen, 1);
      return;
    }
    //检查文件后缀
    if (uploadParams.value.extensions.length > 0) {
      const _lastIndex = file.name.lastIndexOf(".");
      const _extensions = uploadParams.value.extensions;
      if (_lastIndex === -1 || _lastIndex === file.name.length - 1 || !_extensions.includes(file.name.substring(_lastIndex + 1).toLowerCase())) {
        $mW(["文件不正确,仅支持", _extensions.join(",")]);
        files.splice(_filesLen, 1);
        return;
      }
    }
    //检查文件大小
    if (uploadParams.value.fileSizeBt && uploadParams.value.fileSizeBt > 0 && uploadParams.value.fileSizeBt < file.size) {
      $m("CORE_CLIENT.E029", uploadParams.value.fileSizeKb); //上传文件大小不能大于 & KB
      files.splice(_filesLen, 1);
      return;
    }
    //检查图片大小
    checkImgDimension(file).then(res => {
      if (res) {
        const _compress = uploadParams.value.compress;
        if (file.raw.type.toLowerCase().startsWith("image/") && _compress.compress && file.size > _compress.fileSizeBt) {
          processCompressor(file); //压缩文件
        } else {
          submitForm(file);
        }
      } else {
        files.splice(_filesLen, 1);
      }
    });
  };

  //检查图片尺寸大小
  const checkImgDimension = file => {
    return new Promise(resolve => {
      if (file.raw.type.toLowerCase().startsWith("image/") && uploadParams.value.dimension.length === 4) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file.raw);
        fileReader.onload = event => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const [width_0, width_1, height_0, height_1] = uploadParams.value.dimension;
            if (img.width < width_0 || img.width > width_1 || img.height < height_0 || img.height > height_1) {
              $m("CORE_CLIENT.E016", [width_0, height_0, width_1, height_1]); //图片尺寸限制为 & * & 到 & * &
              resolve(false);
            } else {
              resolve(true);
            }
          };
        };
      } else {
        resolve(true);
      }
    });
  };

  //压缩文件
  const processCompressor = file => {
    new Compressor(file.raw, {
      quality: uploadParams.value.compress.quality,
      maxWidth: uploadParams.value.compress.widthMax,
      minWidth: uploadParams.value.compress.widthMin,
      success(result) {
        submitForm(file, result);
      },
      error(err) {
        console.error("压缩文件err-" + file.name, err);
      }
    });
  };

  //编辑文件
  const handleCallEdit = file => {
    refUploadViewEdit.value.callUploadViewEdit(file);
  };

  //编辑保存文件
  const handleUpdFile = updFileObj => {
    updUploadViewFileById(updFileObj).then(res => {
      if (res.code === 200) {
        let _file = fileList.value.find(r => r.fileId === updFileObj.fileId);
        _file.fileDel = updFileObj.fileDel;
        if (_file.name !== updFileObj.fileName) {
          fileRepeat.value = fileRepeat.value.filter(r => r !== _file.name);
          _file.name = updFileObj.fileName;
          _file.fileName = updFileObj.fileName;
          fileRepeat.value.push(_file.name);
        }
        $mS("文件更新成功");
        if (!props.showDelete && updFileObj.fileDel) {
          const _index = fileList.value.findIndex(r => r.uid === _file.uid);
          if (_index !== -1) fileList.value.splice(_index, 1);
          fileRepeat.value = fileRepeat.value.filter(r => r !== _file.name);
        }
        //更新文件数量
        updateFileCount();
      } else {
        $mE("文件更新失败");
      }
    });
  };

  //预览文件
  const handlePreview = file => {
    if (props.previewType === "A") {
      const url = file.fileUrl ? file.fileUrl : file.url;
      if (url) szdFileView({ src: url, fileName: file.name, title: file.name });
    } else if (props.previewType === "B") {
      let _fileList = [];
      const fileIndex = fileList.value.findIndex(r => r.uid === file.uid);
      for (let i = 0; i < fileList.value.length; i++) {
        let item = fileList.value[i];
        _fileList.push({ src: item.fileUrl ? item.fileUrl : item.url, fileName: item.name });
      }
      szdFileView({ fileList: _fileList, fileIndex: fileIndex });
    } else if (props.previewType === "C") {
      const fileIndex = fileList.value.findIndex(r => r.uid === file.uid);
      emit("preview", { fileList: fileList.value, fileIndex: fileIndex });
    }
  };

  //下载文件
  const handleDownload = file => {
    const url = file.fileUrl ? file.fileUrl : file.url;
    if (url) szdFile.downloadFile(url, file.name);
  };

  //报错监控
  const handleExceed = (file, files) => {
    $mW("文件超过允许数量" + uploadParams.value.limit);
  };

  //显示文件图标
  const handleShowIcon = fileName => {
    const _lastIndex = fileName.lastIndexOf(".");
    if (_lastIndex === -1) return fileTypeIcon["obj"];
    const ext = fileName.substring(_lastIndex + 1).toLowerCase();
    return ext && fileTypeIcon[ext] ? fileTypeIcon[ext] : fileTypeIcon["obj"];
  };

  //初始化上传参数
  const initUploadParam = () => {
    initData();
    //上传数据参数
    if (!props.fileCate) $m("CORE_CLIENT.E079", ["fileCate"]); //上传地址参数不能为空
    //文件数量
    uploadParams.value.limit = props.limit && props.limit > 0 ? props.limit : props.limit === 0 ? 0 : 100;
    uploadParams.value.multiple = uploadParams.value.limit !== 1;
    //文件大小
    if (props.fileSize && props.fileSize > 0) {
      uploadParams.value.fileSizeBt = props.fileSize * 1024;
      uploadParams.value.fileSizeKb = props.fileSize;
    }
    //文件类型和后缀
    if (props.accept) {
      uploadParams.value.accept = props.accept;
      uploadParams.value.acceptTxt = $t("提示：仅允许导入") + uploadParams.value.accept + $t("格式文件！");
    }
    if (props.acceptTxt) uploadParams.value.acceptTxt = props.acceptTxt;
    if (props.extensions && Array.isArray(props.extensions)) {
      for (let i = 0; i < props.extensions.length; i++) {
        if (props.extensions[i]) {
          let _ext = props.extensions[i].toString().trim().toLowerCase();
          if (_ext && _ext.startsWith(".")) _ext = _ext.substring(1);
          if (_ext && !uploadParams.value.extensions.includes(_ext)) uploadParams.value.extensions.push(_ext);
        }
      }
    }
    //文件尺寸[宽-最小，宽-最大，高-最小，高-最大]
    if (props.dimension && Array.isArray(props.dimension) && props.dimension.length === 4) {
      uploadParams.value.dimension = props.dimension;
    }
    // 压缩图片
    if (props.compress && _.isObject(props.compress) && props.compress.compress === true) {
      if (props.compress.compress) uploadParams.value.compress.compress = props.compress.compress;
      if (props.compress.fileSize && props.compress.fileSize > 0) uploadParams.value.compress.fileSizeKb = props.compress.fileSize;
      uploadParams.value.compress.fileSizeBt = uploadParams.value.compress.fileSizeKb * 1024;
      if (props.compress.quality && props.compress.quality > 0 && props.compress.quality < 1) {
        uploadParams.value.compress.quality = props.compress.quality;
      }
      if (props.compress.widthMax && props.compress.widthMax > 0) uploadParams.value.compress.widthMax = props.compress.widthMax;
      if (props.compress.widthMin && props.compress.widthMin > 0) uploadParams.value.compress.widthMin = props.compress.widthMin;
    }
  };

  //初始化数据
  const initData = () => {
    uploadParams.value = {
      uploadUrl: "/core/file/uploadView",
      limit: 100, //最大上传文件数
      multiple: false, //是否支持多文件
      fileSizeBt: undefined, //文件大小
      fileSizeKb: "",
      accept: "", //上传文件类型 ".xls,.xlsx"
      acceptTxt: "", //提示信息
      extensions: [], //文件后缀
      dimension: [], //尺寸[宽-最小，宽-最大，高-最小，高-最大]
      compress: {
        compress: false, //是否压缩
        fileSizeBt: 0,
        fileSizeKb: 1024, //超过多大进行压缩KB
        quality: 0.8, //压缩质量
        widthMax: 1600, //压缩最大宽度
        widthMin: 100 //压缩最小宽度
      }
    };
    fileRepeat.value = [];
  };

  //样式类
  const handleClassUpload = () => {
    let _class = [];
    if (uploadParams.value.limit !== 0 && uploadParams.value.limit <= fileList.value.length) {
      _class.push("l-hide-upload-button");
    } else if (_fst.value.disabled) {
      _class.push(props.listType === "button" ? "l-disabled-upload-button2" : "l-disabled-upload-button");
    }
    return _class;
  };

  //更新文件数量
  const updateFileCount = () => {
    emit("update:fileCount", getFileCount());
  };

  //获取文件数量-未删除
  const getFileCount = () => {
    let _count = 0;
    if (fileList.value) {
      for (let i = 0; i < fileList.value.length; i++) {
        if (fileList.value[i].fileDel !== true) _count++;
      }
    }
    return _count;
  };

  //获取文件列表
  const getFileList = () => {
    return fileList.value ? fileList.value : [];
  };

  defineExpose({
    getFileCount,
    getFileList
  });
</script>
<style lang="scss" scoped>
  .l-upload-container {
    display: flex;
    flex: 1;
    padding: 0 3px;
    font-size: $fz;

    .l-upload-comp {
      width: 100%;
    }

    .l-upload-tap {
      display: flex;
      align-items: center;
      text-align: center;
      font-size: 12px;
      color: red;
      padding: 3px 5px 3px 5px;
    }

    :deep(.el-upload-dragger) {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      background: #fafafaad;
      padding: 5px 5px;
      font-size: $fz;
    }

    :deep(.el-upload-list) {
      margin: 5px 0 0 0;
    }

    :deep(.el-upload-list--picture .el-upload-list__item) {
      padding: 5px;
      font-size: $fz;
    }

    :deep(.el-upload-list--picture-card .el-upload-list__item) {
      width: var(--card-w, 120px);
      height: var(--card-h, 120px);
    }

    :deep(.el-upload--picture-card) {
      width: var(--card-w, 120px);
      height: var(--card-h, 120px);
    }

    :deep(.el-upload-list__item) {
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;

      &:hover {
        .l-text-info {
          margin-right: 45px;
        }
      }
    }

    .l-hide-upload-button {
      :deep(.el-upload--text),
      :deep(.el-upload--picture),
      :deep(.el-upload--picture-card) {
        display: none;
        width: 0;
        height: 0;
      }
    }

    .l-disabled-upload-button {
      :deep(.el-upload--text),
      :deep(.el-upload--picture),
      :deep(.el-upload--picture-card) {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: #fafafaad;
        padding: 5px 5px;
        font-size: $fz;
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
      }
    }

    .l-disabled-upload-button2 {
      :deep(.link-type) {
        color: #a8abb2;
        cursor: unset;
      }
    }

    .l-text-info {
      display: inline-flex;
      margin-left: 4px;
      align-items: center;
      font-size: $fz;
      word-break: break-all;
    }

    .l-text-info-picture {
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 1.8;
      padding-left: 8px;
    }

    .l-text-del-line {
      text-decoration: line-through;
    }

    .l-img-picture-card {
      position: relative;
      width: 100%;
      height: 100%;

      .l-img-del {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 12px;
        padding: 2px 5px;
        background: var(--el-border-color);
        color: #606266;
        border: 1px solid var(--el-border-color);
      }
    }

    .l-progress-percentage {
      position: relative;
      border-radius: 2px;
      width: 100%;
      padding: 0 5px;

      :deep(.el-progress) {
        position: unset;
        top: unset;
        transform: unset;
        width: 100%;
      }
    }
  }
</style>
