import request from "../../../common/utils/request";
import requestNoLoading from "../../../common/utils/requestNoLoading";

// 获取会话组配置【抬头信息,按钮信息，提示词（个人和公司）】{groupCode,routerCode, userId}
export function getAiConfig(params) {
  return request({
    url: "/skis/ai/chat/config",
    method: "post",
    data: params
  });
}

// 获取会话组配置-抬头 {groupCode,routerCode, userId}
export function getAiConfigHeader(params) {
  return requestNoLoading({
    url: "/skis/ai/chat/config/header",
    method: "post",
    data: params
  });
}

//获取字段状态{routerCode,bstp}
export function getAiSzdfai(params) {
  return requestNoLoading({
    url: "/core/dev/pro/router/szdfai",
    method: "post",
    data: params
  });
}

// 会话清单  按照更新时间倒序
// 进参数 {groupCode,userId,title:模糊查询}
// {
// chatList:智能会话清单[{sessionId,title,deleFlag}]，
// taskList:自动任务清单[{sessionId,title,deleFlag,taskType,bstp,nodeId,nodeName,skillCode,
// routerCode,routerName,skillInputParam,taskHourSeg(数组),taskEctTime,promptContent,taskStatus}]
// }
export function getAiSession(query) {
  return request({
    url: "/skis/ai/chat/session/get",
    method: "post",
    data: query
  });
}

/******************** 会话内容 ********************/
//会话内容-获取会话内容{sessionId,autoTaskId存在值生效,pageNum,pageSize}
//返回内容{sessionId,pageNum,pageSize,total,
// msgList:[{messageId,btnCode,qaType,content,dataJson,
// filesJson(数组[{fileId,fileName,fileExt后缀,fileType,fileSize,fileUrl}]),
// createTime}]
//}
export function getAiSessionContent(query) {
  return request({
    url: "/skis/ai/chat/session/content/get",
    method: "post",
    data: query
  });
}

//会话内容-获取会话内容{messageId}
export function getAiSessionMessage(messageId) {
  return request({
    url: "/skis/ai/chat/session/content/message/" + messageId,
    method: "get"
  });
}

//会话内容-流式发送
//发送： taskType： A.自动审批  B.分析 空.智能会话
// {
// sessionId,userId,userName,groupCode,btnCode,routerCode,taskType
// message,
// pageDataJson,pageDomJson,
// skillCode,skillInputParams,
// skillJson
// files(数组[{fileId,fileName,fileExt后缀,fileType,fileSize,fileUrl}]),
// }
//流式返回
// {
//  event:'session',data:sessionId
//  event:'text',data:内容
//  event:'title',data:标题
//  event:'dataJson',data:dataJson,
//  event:'done',data:'完成'
//  }
export function sendAiSessionStream(data) {
  return request({
    url: "/skis/ai/chat/session/content/send",
    method: "post",
    data: data
  });
}

/**
 * 停止当前会话的流式任务{sessionId}
 * 根据sessionId找JVM内存中的任务，并同时取消 Dify HTTP 连接和 Dify 远程生成
 */
export function stopAiSessionStream(data) {
  return requestNoLoading({
    url: "/skis/ai/chat/session/content/stop",
    method: "post",
    data: data
  });
}

/**
 * 恢复当前会话的流式任务{sessionId,messageId}
 * 根据sessionId找JVM内存中的任务
 */
export function recoverAiSessionStream(data) {
  return request({
    url: "/skis/ai/chat/session/content/recover",
    method: "post",
    data: data
  });
}

//AI会话结果后续处理更新{messageId,dataJsonSt}
export function updateAiSessionDataJsonSt(data) {
  return requestNoLoading({
    url: "/skis/ai/chat/session/content/update/dataJsonSt",
    method: "post",
    data: data
  });
}

//删除会话消息
export function deleteAiSessionMessage(messageId) {
  return request({
    url: "/skis/ai/chat/session/content/message/" + messageId,
    method: "delete"
  });
}

/******************** 会话内容-上传附件 ********************/
//上传附件  使用通用方法上传requestUploadFile
// 进参：文件流 userId
// 返回：{fileId,fileName,fileExt后缀,fileType,fileSize,fileUrl,fileDir:会话组_用户,timestamp}
export function uploadAiSessionFile(formData) {
  return request({
    url: "/skis/ai/chat/session/content/upload",
    method: "post",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" }
  });
}

//下载附件 TODO-delete
export function downloadAiSessionFile(fileId) {
  return request({
    url: "/skis/ai/chat/session/content/download/" + fileId,
    method: "get",
    responseType: "blob"
  });
}

//删除附件
export function deleteAiSessionFile(fileId) {
  return request({
    url: "/skis/ai/chat/session/content/delete/" + fileId,
    method: "delete"
  });
}
