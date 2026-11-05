import request from "../../../common/utils/request";

// 会话列表
export function perListApi(query) {
  return request({
    url: "/skis/ai/session/content/per",
    method: "post",
    data: query
  });
}

// 会话列表
export function cmpListApi(query) {
  return request({
    url: "/skis/ai/session/content/cmp",
    method: "post",
    data: query
  });
}

// 会话内容列表 TODO-delete
export function getContentRecord(sessionId) {
  return request({
    url: "/skis/ai/session/content/" + sessionId,
    method: "get"
  });
}

//新增会话
// {groupCode,userId,title,sessionHarness,routerCode }
export function addSessionChat(data) {
  return request({
    url: "/skis/ai/chat/session/chat/add",
    method: "post",
    data: data
  });
}

//智能会话-更改会话
// {sessionId, title,sessionHarness }
export function updateSessionChat(data) {
  return request({
    url: "/skis/ai/chat/session/chat/update",
    method: "post",
    data: data
  });
}

//智能会话-删除会话
// {sessionId,deleFlag }
export function deleteSessionChat(data) {
  return request({
    url: "/skis/ai/chat/session/chat/delete",
    method: "post",
    data: data
  });
}

//数据分析推送生成制单
export function createTaskWorkDoc(data) {
  return request({
    url: "/skis/ai/chat/session/taskWorkDoc/create",
    method: "post",
    data: data
  });
}

//数据分析获取工单列表
export function getTaskWorkDocList(data) {
  return request({
    url: "/skis/ai/chat/session/taskWorkDoc/list",
    method: "post",
    data: data
  });
}
