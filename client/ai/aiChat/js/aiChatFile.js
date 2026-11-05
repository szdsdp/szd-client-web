import { reactive } from "vue";
import { $mE } from "../../../common/utils/globalConfig";
import { requestUploadFile } from "../../../common/utils/requestUpload";

const FileTypes = [
  "image/jpeg",
  "image/png",
  "text/plain",
  "text/markdown",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

/**
 * 选择文件处理
 */
export function senderSelectFile(obj, sessionObj, dg, globalConfig) {
  if (!sessionObj.fileList) sessionObj.fileList = [];
  //上传文件允许最大数
  let maxFileNum = 5;
  let tempConfig = globalConfig.find(r => r.configKey === "SKIS_AI_FILE_MAX_NUM");
  if (tempConfig?.configValue && Number(tempConfig.configValue)) {
    maxFileNum = Number(tempConfig.configValue);
  }
  let sumFileNum = sessionObj.fileList.length + obj.fileList.length;
  if (sumFileNum > maxFileNum) {
    $mE(["上传文件数超出限制", maxFileNum]);
    return;
  }
  //文件大小
  let maxSizeM = 50;
  tempConfig = globalConfig.find(r => r.configKey === "SKIS_AI_FILE_MAX_SIZE");
  if (tempConfig?.configValue && Number(tempConfig.configValue)) {
    maxSizeM = Number(tempConfig.configValue);
  }
  let maxSize = maxSizeM * 1024 * 1024;
  //文件后缀
  let extensions = [];
  tempConfig = globalConfig.find(r => r.configKey === "SKIS_AI_FILE_EXT");
  if (tempConfig && tempConfig.configJson) {
    extensions = JSON.parse(tempConfig.configValue).map(r => r.replace(/^\./, "").toLowerCase());
  }
  //遍历上传文件
  for (let i = 0; i < obj.fileList.length; i++) {
    //检查文件大小
    if (obj.fileList[i].size > maxSize) {
      $mE(["文件大小不能超过", maxSizeM, "MB：", obj.fileList[i].name]);
      continue;
    }
    //文件类型只允许
    if (extensions && extensions.length > 0) {
      const ext = obj.fileList[i].name.split(".").pop()?.toLowerCase();
      if (!extensions.includes(ext)) {
        $mE(["上传文件后缀不允许，仅支持", extensions.join(","), "错误文件:", obj.fileList[i].name]);
        continue;
      }
    } else {
      if (!FileTypes.includes(obj.fileList[i].type)) {
        $mE(["文件类型不允许上传：", obj.fileList[i].name]);
        continue;
      }
    }
    uploadFile(sessionObj, dg, obj.fileList[i], i);
  }
}

/**
 * 上传文件
 */
function uploadFile(sessionObj, dg, file, i) {
  if (!sessionObj.fileList) sessionObj.fileList = [];
  //添加文件
  let _file = reactive({ uid: Date.now() + "_" + i, fileName: file.name, status: "uploading", percent: 0, raw: file });
  sessionObj.fileList.push(_file);
  //上传文件
  const uploadUrl = "/skis/ai/chat/session/content/upload";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", dg.userId);
  formData.append("groupCode", dg.groupCode);
  formData.append("sessionId", sessionObj.sessionId);
  requestUploadFile(uploadUrl, formData, progress => handleProgress(progress, _file))
    .then(res => {
      if (res.code === 200) {
        _file.status = "done";
        _file.fileId = res.data.fileId;
        _file.fileExt = res.data.fileExt;
        _file.fileType = res.data.fileType;
        _file.fileSize = res.data.fileSize;
        _file.fileUrl = res.data.fileUrl;
        _file.fileDir = res.data.fileDir;
        _file.timestamp = res.data.timestamp;
      } else {
        uploadFileError(sessionObj, _file);
      }
    })
    .catch(() => {
      uploadFileError(sessionObj, _file);
    });
}

/**
 * 文件显示进度
 */
function handleProgress(progress, _file) {
  _file.percent = progress.percent;
}

/**
 * 上传文件错误
 */
function uploadFileError(sessionObj, _file) {
  $mE(["上传文件失败", _file.fileName]);
  _file.status = "error";
  const _index = sessionObj.fileList.findIndex(r => r.uid === _file.uid);
  if (_index > -1) sessionObj.fileList.splice(_index, 1);
}

/**
 * 删除文件
 */
export function senderRemoveFile(sessionObj, file) {
  if (!sessionObj.fileList) return;
  const index = sessionObj.fileList.findIndex(r => r.uid === file.file.uid);
  if (index > -1) {
    sessionObj.fileList.splice(index, 1);
  }
}
