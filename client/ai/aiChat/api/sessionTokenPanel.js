import request from "../../../common/utils/request";

// 会话Token统计 参数 {userId month}
export function getSessionTokenStats(query) {
  return request({
    url: "/skis/ai/session/token/stats",
    method: "post",
    data: query
  });
}
