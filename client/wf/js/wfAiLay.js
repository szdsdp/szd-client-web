//初始化aiLay
export function initAiLay(routerCode, wfOper, bussBase) {
  let aiLay = {
    layout: {
      groupCode: wfOper.wfAi.groupCode || "",
      routerCode: routerCode || wfOper.routerCode || "",
      bstp: bussBase?.bstp || "",
      bstpName: bussBase?.bstpName || "",
      nodeId: wfOper.wfInst.wfId && wfOper.wfInst.nodeId ? wfOper.wfInst.wfId + "." + wfOper.wfInst.nodeId : "",
      nodeName: wfOper.wfInst.nodeName || "",
      collectMode: ["0", "1", "2"].includes(wfOper.wfAi.collectMode) ? wfOper.wfAi.collectMode : "1", //0.不采集, 1.组件处理采集 2.回调处理采集
      wf: {
        hide_btn_approve: false,
        hide_btn_reject: false
      }
    },
    aiFst: wfOper.wfOper.szdfai,
    szdopt: wfOper.wfOper.szdopt || "V"
  };
  return aiLay;
}
