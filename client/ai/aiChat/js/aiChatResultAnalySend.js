import { szdWf } from "../../../wf/indexFunction";
import { isObject } from "./aiChatInit";
import { createTaskWorkDoc, getTaskWorkDocList } from "../api/sessionRecord";

//转化AnalySend数据
export function convertAnalySendData(aiDataObj) {
  let dataSt = [];
  try {
    if (!aiDataObj || typeof aiDataObj !== "object") return dataSt;
    let analySendList = Array.isArray(aiDataObj) ? aiDataObj : [aiDataObj];
    for (let i = 0; i < analySendList.length; i++) {
      const item = analySendList[i];
      if (!isObject(item) || (!item.conclusion && !item.comment && !item.analyResult)) continue;
      dataSt.push({
        itemNo: i + 1, //任务ID
        userId: item.userId || "", //用户
        userName: item.userName || "",
        bstp: item.bstp || "", //业务类型
        bstpName: item.bstpName || "",
        conclusion: item.conclusion || "", //结论
        workOrderUniqKey: item.workOrderUniqKey || "", //工单唯一值
        comment: item.comment || "", //结论批注
        analyResult: item.analyResult || "", //分析结果
        wfBussIds: [] //AI工单
      });
    }
  } catch (e) {
    console.error("convertAnalySendData error:", e);
  }
  return dataSt;
}

//生成待办工单
export function processDataAnalySend(sessionObj, confirmData) {
  let taskToDo = [];
  for (let i = 0; i < confirmData.analyList.length; i++) {
    let item = confirmData.analyList[i];
    taskToDo.push({
      sessionId: sessionObj.sessionId,
      messageId: confirmData.msgObj.messageId,
      itemNo: item.itemNo,
      userId: item.userId,
      bstp: item.bstp,
      conclusion: item.conclusion,
      workOrderUniqKey: item.workOrderUniqKey,
      comment: item.comment,
      analyResult: item.analyResult,
      commitFlag: confirmData.btnCode === "skill_analy_send_confirm_C" //自动提交
    });
  }
  //生成待办
  createTaskWorkDoc(taskToDo).then(res => {
    if (res.code === 200) {
      szdWf.retMsg(res.data);
      getAnalySendToDo(confirmData.analyList);
    }
  });
}

//获取待办工单列表
export function getAnalySendToDo(analyList) {
  let query = [];
  for (let i = 0; i < analyList.length; i++) {
    let item = analyList[i];
    item.wfBussIds = [];
    query.push({ messageId: item.messageId, itemNo: item.itemNo, userId: item.userId, workOrderUniqKey: item.workOrderUniqKey });
  }
  if (query.length === 0) return;
  getTaskWorkDocList(query).then(res => {
    if (res.code === 200) {
      for (let i = 0; i < res.data.length; i++) {
        let item = res.data[i];
        let analyObj = analyList.find(r => r.itemNo === item.itemNo);
        if (analyObj) {
          analyObj.wfBussIds = item.wfBussIds;
        }
      }
    }
  });
}
