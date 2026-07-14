import { createVNode, render } from "vue";
import szdRouter from "../../common/utils/goRouter";
import { $m } from "../../common/utils/globalConfig";
import { getPrintTemplateList } from "../api/printTemplate";
import printTemplate from "./printTemplate.vue";

let ctx;

/**
 * 打印-路由代码模式
 * @param {String} routerCode 路由代码
 * @param {Object} params 打印参数
 *
 */
export async function szdPrtRouter(routerCode, params) {
  if (!routerCode) return;
  //获取打印参数
  let queryParam = [{ routerCode: routerCode }];
  //选择打印模板
  const printList = await szdPrtShowTemplate(queryParam);
  if (printList.length === 0) return;
  //零代码打印
  let zeroProgram = [];
  for (let i = 0; i < printList.length; i++) {
    let item = printList[i];
    if (item.routerCode === "CORE_SCP_03P") {
      zeroProgram.push(item.program);
    } else {
      szdRouter.goNav(item.routerCode, params);
    }
  }
  //零代码打印
  if (zeroProgram.length > 0 && params.bussId) {
    let bussIds = params.bussId.toString().split(",");
    let zeroParams = [];
    for (let i = 0; i < bussIds.length; i++) {
      for (let j = 0; j < zeroProgram.length; j++) {
        zeroParams.push({ program: zeroProgram[j], bussId: bussIds[i] });
      }
    }
    if (zeroParams.length > 0) szdRouter.goNavPrt(zeroParams);
  }
}

export async function szdPrtRouterDg(routerCode) {
  if (!routerCode) return;
  //获取打印参数
  let queryParam = [{ routerCode: routerCode }];
  //选择打印模板
  const printList = await szdPrtShowTemplate(queryParam, false);
  if (printList.length === 0) return;
  return printList[0];
}

/**
 * 打印-BussId模式
 * @param {Array | Object} params 打印模板选择参数
 * [{routerCode:路由代码,bstp:业务类型,bussId:单据Id}]
 */
export async function szdPrtBussId(params) {
  if (!params) return;
  let paramsArr = Array.isArray(params) ? params : [params];
  //获取打印参数
  let queryParam = szdPrtBussIdQueryParam(paramsArr);
  //选择打印模板
  const printList = await szdPrtShowTemplate(queryParam);
  if (printList.length === 0) return;
  szdPrtBussIdGoNav(printList, paramsArr);
}

// 调用打印
function szdPrtBussIdGoNav(printList, paramArr) {
  let prtRouter = {};
  for (let i = 0; i < printList.length; i++) {
    let prtItem = printList[i];
    if (!prtRouter[prtItem.routerCode]) prtRouter[prtItem.routerCode] = [];
    prtRouter[prtItem.routerCode].push(prtItem);
  }
  //调用打印
  for (let key in prtRouter) {
    if (key === "CORE_SCP_03P") {
      let zeroParams = [];
      //打印数据
      for (let j = 0; j < paramArr.length; j++) {
        let parItem = paramArr[j];
        if (!parItem.bussId) continue;
        let bussIds = parItem.bussId.toString().split(",");
        for (let k = 0; k < bussIds.length; k++) {
          for (let i = 0; i < prtRouter[key].length; i++) {
            let prtItem = prtRouter[key][i];
            if (
              (parItem.bstp && prtItem.bstpArr.includes(parItem.bstp)) ||
              (parItem.routerCode && prtItem.routerCodeArr.includes(parItem.routerCode))
            ) {
              zeroParams.push({ program: prtItem.program, bussId: bussIds[k] });
            }
          }
        }
      }
      if (zeroParams.length > 0) szdRouter.goNavPrt(zeroParams);
    } else {
      let bussIds = "";
      for (let j = 0; j < paramArr.length; j++) {
        let parItem = paramArr[j];
        //打印模板
        for (let i = 0; i < prtRouter[key].length; i++) {
          let prtItem = prtRouter[key][i];
          if (
            (parItem.bstp && prtItem.bstpArr.includes(parItem.bstp)) ||
            (parItem.routerCode && prtItem.routerCodeArr.includes(parItem.routerCode))
          ) {
            bussIds += (bussIds ? "," : "") + parItem.bussId;
          }
        }
      }
      if (bussIds) szdRouter.goNav(key, { bussId: bussIds });
    }
  }
}

/*** 查询参数  */
function szdPrtBussIdQueryParam(paramArr) {
  let queryParam = [];
  for (let i = 0; i < paramArr.length; i++) {
    let item = paramArr[i];
    if (!item?.routerCode && !item?.bstp) {
      $m("CORE_CLIENT.E119"); //参数错误[routerCode]或[bstp]至少维护其中之一
      return [];
    }
    if (!queryParam.find(r => r.routerCode === item.routerCode && r.bstp === item.bstp)) {
      queryParam.push({ routerCode: item.routerCode, bstp: item.bstp });
    }
  }
  return queryParam;
}

//显示选择打印模板窗口
async function szdPrtShowTemplate(queryParam, moreTemplate = true) {
  if (!queryParam || queryParam.length === 0) return [];
  const res = await getPrintTemplateList(queryParam);
  if (res.code !== 200 || !res.data || res.data.length === 0) {
    $m("CORE_CLIENT.E021", res.data?.length === 0 ? "" : res.msg); //本功能不支持打印 &
    return [];
  }
  for (let i = 0; i < res.data.length; i++) {
    if (!res.data[i].routerCode) res.data[i].routerCode = "CORE_SCP_03P";
  }
  //直接打印
  if (res.data.length === 1) {
    return res.data;
  }
  //选择打印模板
  return new Promise(resolve => {
    let resolveFlag = false;
    const div = document.createElement("div");
    const vNode = createVNode(printTemplate, {
      printTemplate: res.data,
      moreTemplate: moreTemplate,
      onOkay: retPrintArr => {
        resolve(retPrintArr);
        resolveFlag = true;
      },
      onCloseForm: () => {
        if (!resolveFlag) {
          resolve([]);
        }
        document.body.removeChild(div);
      }
    });
    vNode.appContext = ctx;
    document.body.appendChild(div);
    render(vNode, div);
  });
}

/**
 * 设置上下文
 */
const setPrtTemplate = function (app) {
  ctx = app._context;
};

export default setPrtTemplate;
