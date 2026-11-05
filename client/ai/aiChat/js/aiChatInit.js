import { convertCollectDOM } from "./aiChatResultCollect";
import { getAiSzdfai } from "../api/aiChat";

/**
 * 初始化参数
 */
export function initAiLay(aiLay) {
  return {
    groupCode: aiLay.groupCode || "", //会话组
    routerCode: aiLay.routerCode || "", //路由
    bstp: aiLay.bstp || "", //业务类型
    bstpName: aiLay.bstpName || "",
    nodeId: aiLay.nodeId || "", //节点Id
    nodeName: aiLay.nodeName || "",
    showPage: aiLay.showPage === true, //激活分页
    collectMode: ["0", "1", "2"].includes(aiLay.collectMode) ? aiLay.collectMode : "1", //0.不采集, 1.组件处理采集 2.回调处理采集
    wf: {
      hide_btn_approve: (aiLay.wf && aiLay.wf.hide_btn_approve) === true, //隐藏审批按钮
      hide_btn_reject: (aiLay.wf && aiLay.wf.hide_btn_reject) === true //隐藏拒绝按钮
    }
  };
}

/**
 * 初始化DOM字段状态
 */
export async function initAiDom(aiLay, propsAiFst, _aiFst, _aiDomObj) {
  _aiDomObj.value.collectDom = [];
  _aiFst.value = "";
  console.log("初始化DOM字段状态", propsAiFst);
  if (propsAiFst) {
    if (typeof propsAiFst !== "object") {
      _aiFst.value = String(propsAiFst).trim();
    } else if (Array.isArray(propsAiFst)) {
      if (propsAiFst.length > 0) _aiFst.value = propsAiFst;
    } else if (isObject(propsAiFst)) {
      _aiFst.value = propsAiFst;
    }
  }
  //获取内部数据采集的dom
  if (_aiFst.value) {
    _aiDomObj.value.collectDom = convertCollectDOM(_aiFst.value, true);
  } else if (aiLay.routerCode || aiLay.bstp) {
    const res = await getAiSzdfai({ routerCode: aiLay.routerCode, bstp: aiLay.bstp });
    if (res.code === 200 && res.data) {
      _aiFst.value = res.data;
      _aiDomObj.value.collectDom = convertCollectDOM(_aiFst.value, true);
    }
  }
}

/**
 * 检查是否对象
 */
export function isObject(obj) {
  return obj && typeof obj === "object" && !Array.isArray(obj) && Object.keys(obj).length > 0;
}
