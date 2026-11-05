import request from "../../../common/utils/request";

// 知识库列表
export function listApi(query) {
  return request({
    url: "/skis/ai/confige/kb/list",
    method: "post",
    data: query
  });
}

// 知识库详情
export function getApi(kbId) {
  return request({
    url: "/skis/ai/confige/kb/get/" + kbId,
    method: "get"
  });
}

// 新增知识库
export function addApi(data) {
  return request({
    url: "/skis/ai/confige/kb/add",
    method: "post",
    data: data
  });
}

// 修改知识库
export function updateApi(data) {
  return request({
    url: "/skis/ai/confige/kb/update",
    method: "put",
    data: data
  });
}

// 删除知识库【抬头、附件、关联会话组】
export function deleteApi(kbId) {
  return request({
    url: "/skis/ai/confige/kb/delete/" + kbId,
    method: "delete"
  });
}

// 上传知识库 RAG文件命名：公司单号_文件名称; 用户/单号_文件名称
export function uploadDocApi(formData) {
  return request({
    url: "/skis/ai/confige/kb/documents/upload",
    method: "post",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" }
  });
}

// 删除知识库
export function deleteDocApi(kbId, fileId) {
  return request({
    url: "/skis/ai/confige/kb/documents/delete",
    method: "delete",
    params: { kbId, fileId }
  });
}

/*************************************************************************
 * 获取文档段
 */
// 查询文档段列表
export function getSegListApi(kbId, fileId) {
  return request({
    url: "/skis/ai/confige/kb/documents/segments",
    method: "get",
    params: { kbId, fileId }
  });
}

// 更新文档段内容
export function updateSegApi(data) {
  return request({
    url: "/skis/ai/confige/kb/documents/segment/update",
    method: "post",
    data: data
  });
}

// 删除文档段
export function deleteSegApi(kbId, fileId, segId) {
  return request({
    url: "/skis/ai/confige/kb/documents/segment/delete",
    method: "delete",
    params: { kbId, fileId, segId }
  });
}
