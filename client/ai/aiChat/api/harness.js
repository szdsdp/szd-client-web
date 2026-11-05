import request from "../../../common/utils/request";

// Harness列表
export function listApi(query) {
  return request({
    url: "/skis/ai/confige/harness/list",
    method: "post",
    data: query
  });
}

// Harness详情
export function getApi(harnessId) {
  return request({
    url: "/skis/ai/confige/harness/get/" + harnessId,
    method: "get"
  });
}

// Harness新增
export function addApi(data) {
  return request({
    url: "/skis/ai/confige/harness/add",
    method: "post",
    data: data
  });
}

// Harness修改
export function updateApi(data) {
  return request({
    url: "/skis/ai/confige/harness/update",
    method: "put",
    data: data
  });
}

// Harness删除
export function deleteApi(harnessId) {
  return request({
    url: "/skis/ai/confige/harness/delete/" + harnessId,
    method: "delete"
  });
}
