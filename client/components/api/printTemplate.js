import request from "../../common/utils/request";

/**
 * 获取打印模板清单
 * @param  data 进参 [{ routerCode, bstp }]
 * @returns 返回 [{routerCode,program,templateName,isAll,bstpArr,routerCodeArr}]
 * */
export function getPrintTemplateList(data) {
  return request({
    url: "/core/dev/pro/router/print",
    method: "post",
    data: data
  });
}
