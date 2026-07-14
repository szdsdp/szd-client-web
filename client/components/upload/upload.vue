<template>
  <!-- 通用导入组件 -->
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
    <!-- 导入文件提示信息 -->
    <div v-if="uploadParams.listType === 'picture-card' && uploadParams.acceptTxt" style="padding: 5px 0; color: #1890ff">
      {{ uploadParams.acceptTxt }}
    </div>

    <el-upload
      ref="refUpload"
      :multiple="uploadParams.limit > 1"
      :limit="uploadParams.limit"
      :accept="uploadParams.accept"
      action=""
      :auto-upload="false"
      :list-type="uploadParams.listType"
      v-model:file-list="fileList"
      :disabled="dg.disabled"
      @change="handleChange"
      @exceed="handleExceed"
      @remove="handleRemove"
      :drag="uploadParams.listType !== 'picture-card'">
      <el-icon v-if="uploadParams.listType === 'picture-card'">
        <Plus />
      </el-icon>
      <!-- 显示图标 -->
      <template v-if="uploadParams.listType === 'picture-card'" #file="{ file }">
        <img v-if="file.raw.type.startsWith('image/')" :src="file.url" class="el-upload-list__item-thumbnail" />
        <div v-else style="display: flex; align-items: center; justify-content: center; width: 100%">
          <img :src="handleShowIcon(file.name)" class="el-upload-list__item-thumbnail" style="width: 75%" />
        </div>
        <!-- 图片上按钮 -->
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-preview" @click="handlePreview(file)">
            <el-icon><ZoomIn /></el-icon>
          </span>
          <span class="el-upload-list__item-delete" @click="handleRemove(file)">
            <el-icon><Delete /></el-icon>
          </span>
        </span>
      </template>
      <!-- 拖拽导入 -->
      <div v-if="uploadParams.listType !== 'picture-card'">
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
      <szd-button label="下载模板" type="primary" @click="handleDownloadTM" v-if="uploadParams.TMCode" />
      <szd-button label="确定" type="primary" :disable="dg.disabled" @click="submitForm" />
      <szd-button label="取消" type="primary" @click="handleCloseForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { onMounted, ref } from "vue";
  import _ from "lodash";
  import Compressor from 'compressorjs'
  import { $m, $mS, $mW, $t } from "../../common/utils/globalConfig";
  import { downloadTemplate, uploadFile } from "../api/upload";
  import { szdMsgBox } from "../msgBox/msgBox";
  import szdDate from "../../common/tools/date";
  import szdStoreCookie from "../../common/store/storeCookie";
  import szdFile from "../../common/tools/fileTool";
  import { szdFileView } from "../../components/fileView/fileView";

  const props = defineProps({
    updParams: {
      type: Object,
      default: {}
    }
  });

  const emit = defineEmits(["uploadResult", "closeDialog"]);
  //上传文件控件
  const refUpload = ref();

  //窗口对象
  const dg = ref({
    open: false,
    disabled: false,
    //设置上传的请求头部
    header: { Authorization: "Bearer " + szdStoreCookie.getToken() },
    action: "/core/common/file/upload" //上传地址
  });

  //上传参数
  const uploadParams = ref({
    limit: 1, //最大上传文件数
    fileSize: undefined, //文件大小-KB
    fileSizeKb: "",
    dimension: [], //尺寸[宽-最小，宽-最大，高-最小，高-最大]
    accept: "", //上传文件类型
    acceptTxt: "", //提示信息
    extensions: [], //文件后缀
    uploadUrl: "", //上传地址
    fileCate: "", //附件类别-根目录
    filePath: "", //文件路径
    bussId: "", //业务id
    custParam: {}, //自定义参数
    showMsgBox: true, //显示消息
    listType: "text", //文件列表的类型
    TMCode: "", //下载模板
    title: "", //标题
    dialogWidth: 400, //窗口宽度
    dialogHeight: 450, //窗口高度
    compress: {
      compress: false, //是否压缩
      fileSize: 1024, //超过多大进行压缩KB
      quality: 0.8, //压缩质量
      widthMax: 1600, //压缩最大宽度
      widthMin: 100 //压缩最小宽度
    }
  });
  //上传文件清单
  const fileList = ref([]);
  const fileUpload = ref([]);
  const fileCompressor = ref([]);
  //卡片图标
  const fileTypeIcon = szdFile.getFileTypeIcon();

  onMounted(() => {
    initUploadParam(props.updParams);
  });

  //初始化上传参数
  const initUploadParam = infoParam => {
    initData();
    //上传数据参数
    if (!infoParam.uploadUrl && !infoParam.fileCate) {
      $m("CORE_CLIENT.E079"); //上传地址参数不能为空
      return;
    }

    if (infoParam.limit && infoParam.limit > 1) uploadParams.value.limit = infoParam.limit;
    if (infoParam.fileSize && infoParam.fileSize > 0) {
      uploadParams.value.fileSize = infoParam.fileSize * 1024;
      uploadParams.value.fileSizeKb = infoParam.fileSize;
    }
    if (infoParam.dimension && Array.isArray(infoParam.dimension) && infoParam.dimension.length === 4) {
      uploadParams.value.dimension = infoParam.dimension;
    }
    if (infoParam.accept) {
      uploadParams.value.accept = infoParam.accept;
      uploadParams.value.acceptTxt = $t("提示：仅允许导入") + uploadParams.value.accept + $t("格式文件！");
    }
    if (infoParam.acceptTxt) uploadParams.value.acceptTxt = infoParam.acceptTxt;
    if (infoParam.extensions && Array.isArray(infoParam.extensions)) {
      for (let i = 0; i < infoParam.extensions.length; i++) {
        uploadParams.value.extensions.push(infoParam.extensions[i].toString().toLowerCase());
      }
    }
    uploadParams.value.listType = ["text", "picture", "picture-card"].includes(infoParam.listType) ? infoParam.listType : "text";
    uploadParams.value.uploadUrl = infoParam.uploadUrl ? infoParam.uploadUrl : "/core/common/file/upload";
    uploadParams.value.bussId = infoParam.bussId;
    uploadParams.value.fileCate = infoParam.fileCate;
    uploadParams.value.filePath = infoParam.filePath;
    uploadParams.value.custParam = infoParam.custParam;
    if (infoParam.showMsgBox === false) uploadParams.value.showMsgBox = infoParam.showMsgBox;
    if (infoParam.TMCode) uploadParams.value.TMCode = infoParam.TMCode;
    if (infoParam.title) uploadParams.value.title = infoParam.title;
    if (infoParam.dialogWidth && infoParam.dialogWidth > 10) uploadParams.value.dialogWidth = infoParam.dialogWidth;
    if (infoParam.dialogHeight && infoParam.dialogHeight > 10) uploadParams.value.dialogHeight = infoParam.dialogHeight;
    // 压缩图片
    if (infoParam.compress && _.isObject(infoParam.compress) && infoParam.compress.compress === true) {
      if (infoParam.compress.compress) uploadParams.value.compress.compress = infoParam.compress.compress;
      if (infoParam.compress.fileSize && infoParam.compress.fileSize > 0) uploadParams.value.compress.fileSize = infoParam.compress.fileSize;
      uploadParams.value.compress.fileSize = uploadParams.value.compress.fileSize * 1024;
      if (infoParam.compress.quality && infoParam.compress.quality > 0 && infoParam.compress.quality < 1) {
        uploadParams.value.compress.quality = infoParam.compress.quality;
      }
      if (infoParam.compress.widthMax && infoParam.compress.widthMax > 0) uploadParams.value.compress.widthMax = infoParam.compress.widthMax;
      if (infoParam.compress.widthMin && infoParam.compress.widthMin > 0) uploadParams.value.compress.widthMin = infoParam.compress.widthMin;
    }
    dg.value.open = true;
  };

  //下载模版
  const handleDownloadTM = () => {
    downloadTemplate(uploadParams.value.TMCode).then(response => {
      // 利用a标签自定义下载文件名
      const link = document.createElement("a");
      // 创建Blob对象，设置文件类型
      let blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
      });
      let objectUrl = URL.createObjectURL(blob); // 创建URL
      link.href = objectUrl;
      link.download = uploadParams.value.TMCode + "_" + szdDate.format(undefined, "YYYYMMDDHHmmssSSS"); // 自定义文件名
      link.click(); // 下载文件
      URL.revokeObjectURL(objectUrl); // 释放内存
      $m("CORE_CLIENT.S010"); //导出文件成功
    });
  };

  //文件上传
  const submitForm = () => {
    if (fileUpload.value.length === 0) {
      $mW("请选择上传文件");
      return;
    }
    dg.value.disabled = true;
    let uploadObj = {
      bussId: uploadParams.value.bussId,
      fileCate: uploadParams.value.fileCate,
      filePath: uploadParams.value.filePath,
      custParam: uploadParams.value.custParam,
      fileUpload: []
    };
    for (let i = 0; i < fileUpload.value.length; i++) {
      let item = fileUpload.value[i];
      let _compress = fileCompressor.value.find(r => r.fileName === item.fileName);
      if (_compress) {
        uploadObj.fileUpload.push(_compress);
      } else {
        uploadObj.fileUpload.push(item);
      }
    }
    uploadFile(uploadParams.value.uploadUrl, uploadObj).then(response => {
      emit("uploadResult", response);
      if (uploadParams.value.showMsgBox) {
        if (response && response.data) {
          if (Array.isArray(response.data) && response.data.length > 0) {
            szdMsgBox(response.data).then(() => {});
          } else {
            $mS("文件上传完成");
          }
        } else if (response && Array.isArray(response) && response.length > 0) {
          szdMsgBox(response).then(() => {});
        } else {
          $mS("文件上传完成");
        }
      }
      dg.value.open = false;
    });
  };

  //检查文件和调整为上传
  const handleChange = (file, files) => {
    const _filesLen = files.length - 1;
    //检查文件名是否重复
    if (fileUpload.value.find(r => r.fileName === file.name)) {
      $mW("存在相同的文件名");
      files.splice(_filesLen, 1);
      return;
    }
    //检查文件后缀
    if (uploadParams.value.extensions.length > 0) {
      const _lastIndex = file.name.lastIndexOf(".");
      if (
        _lastIndex === -1 ||
        _lastIndex === file.name.length - 1 ||
        !uploadParams.value.extensions.includes(file.name.substring(_lastIndex + 1).toLowerCase())
      ) {
        $mW("文件不正确");
        files.splice(_filesLen, 1);
        return;
      }
    }
    //检查文件大小
    if (uploadParams.value.fileSize && uploadParams.value.fileSize > 0 && uploadParams.value.fileSize < file.size) {
      $m("CORE_CLIENT.E029", uploadParams.value.fileSizeKb); //上传文件大小不能大于 & KB
      files.splice(_filesLen, 1);
      return;
    }
    //检查图片大小
    checkImgDimension(file).then(res => {
      if (res) {
        //添加原文件
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file.raw);
        fileReader.onload = event => {
          fileUpload.value.push({ fileName: file.name, fileBase64: event.target.result });
        };
        //添加压缩文件
        if (
          file.raw.type.toLowerCase().startsWith("image/") &&
          uploadParams.value.compress.compress === true &&
          file.size > uploadParams.value.compress.fileSize
        ) {
          processCompressor(file);
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

  //添加压缩文件
  const processCompressor = file => {
    new Compressor(file.raw, {
      quality: uploadParams.value.compress.quality,
      maxWidth: uploadParams.value.compress.widthMax,
      minWidth: uploadParams.value.compress.widthMin,
      success(result) {
        const fileResult = new File([result], result.name, {
          type: result.type,
          lastModified: result.lastModified,
          size: result.size
        });
        const fileReader = new FileReader();
        fileReader.readAsDataURL(fileResult);
        fileReader.onload = event => {
          fileCompressor.value.push({ fileName: file.name, fileBase64: event.target.result });
        };
      },
      error(err) {
        console.error("压缩文件err-" + file.name, err);
      }
    });
  };

  //移除文件
  const handleRemove = file => {
    const _index0 = fileList.value.findIndex(r => r.name === file.name);
    if (_index0 !== -1) {
      fileList.value.splice(_index0, 1);
    }
    const _index1 = fileUpload.value.findIndex(r => r.fileName === file.name);
    if (_index1 > -1) {
      fileUpload.value.splice(_index1, 1);
    }
    const _index2 = fileCompressor.value.findIndex(r => r.fileName === file.name);
    if (_index2 > -1) {
      fileCompressor.value.splice(_index2, 1);
    }
  };

  //预览文件
  const handlePreview = file => {
    if (file.url) szdFileView({ src: file.url, fileName: file.name });
  };

  //报错监控
  const handleExceed = () => {
    $mW("文件超过允许数量");
  };

  //显示文件图标
  const handleShowIcon = fileName => {
    const _lastIndex = fileName.lastIndexOf(".");
    if (_lastIndex === -1) return fileTypeIcon["obj"];
    const ext = fileName.substring(_lastIndex + 1).toLowerCase();
    return ext && fileTypeIcon[ext] ? fileTypeIcon[ext] : fileTypeIcon["obj"];
  };

  //初始化数据
  const initData = () => {
    dg.value.disabled = false;
    uploadParams.value = {
      limit: 1, //最大上传文件数
      fileSize: undefined, //文件大小
      fileSizeKb: "",
      dimension: [], //尺寸[宽-最小，宽-最大，高-最小，高-最大]
      accept: "", //上传文件类型 ".xls,.xlsx"
      acceptTxt: "", //提示信息
      extensions: [], //文件后缀
      listType: "text", //文件列表的类型
      uploadUrl: "", //上传地址
      fileCate: "", //附件类别-根目录
      filePath: "", //文件路径
      bussId: "", //业务id
      custParam: {}, //业务id
      showMsgBox: true, //显示消息盒子
      TMCode: "", //下载模板
      title: "", //标题
      dialogWidth: 400, //窗口宽度
      dialogHeight: 450, //窗口高度
      compress: {
        compress: false, //是否压缩
        fileSize: 1024, //超过多大进行压缩KB
        quality: 0.8, //压缩质量
        widthMax: 1600, //压缩最大宽度
        widthMin: 100 //压缩最小宽度
      }
    };
    fileList.value = [];
    fileUpload.value = [];
    fileCompressor.value = [];
  };

  const handleCloseForm = () => {
    dg.value.open = false;
  };

  const handleClose = () => {
    refUpload.value.clearFiles();
    fileList.value = [];
    fileUpload.value = [];
    fileCompressor.value = [];
    emit("closeDialog");
  };
</script>
