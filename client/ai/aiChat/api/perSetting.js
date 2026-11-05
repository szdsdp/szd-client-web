import request from "../../../common/utils/request";

// 个人设置-会话组详情
export function getApi(groupCode, userId) {
  return request({
    url: "/skis/ai/person/setting/get/" + groupCode + "/" + userId,
    method: "get"
  });
}

// 个人设置-会话组保存
export function saveApi(data) {
  return request({
    url: "/skis/ai/person/setting/save",
    method: "post",
    data: data
  });
}

/**
 ****************** SQL技能配置
 **/
//查询表配置
export function getTableConfig(sysCode, tableCode) {
  return request({
    url: "/core/dev/table/config/" + sysCode + "/" + tableCode,
    method: "get"
  });
}
