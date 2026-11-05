import request from "../../../common/utils/request";
import requestNoLoading from "../../../common/utils/requestNoLoading";

// 自动任务列表-个人
export function perListApi(query) {
  return request({
    url: "/skis/ai/auto-task/content/per",
    method: "post",
    data: query
  });
}

// 自动任务列表-公司
export function cmpListApi(query) {
  return request({
    url: "/skis/ai/auto-task/content/cmp",
    method: "post",
    data: query
  });
}

//AI统计{ aiTaskCount: AI 本月任务总数  aiTaskUnread: AI 任务未读取 aiTaskTodo: AI 待办未处理 }
//core中使用
export function getUserStatAi() {
  return requestNoLoading({
    url: "/skis/ai/auto-task/user/stats",
    method: "get"
  });
}

//设置已读未读标记 {readFlag,autoTaskIdArr:[]}
export function setReadFlagApi(data) {
  return request({
    url: "/skis/ai/auto-task/content/read",
    method: "post",
    data: data
  });
}

// 自动任务详情 TODO-delete
export function getContentApi(autoTaskId) {
  return request({
    url: "/skis/ai/auto-task/content/" + autoTaskId,
    method: "get"
  });
}
