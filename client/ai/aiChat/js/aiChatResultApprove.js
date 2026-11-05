import { isObject } from "./aiChatInit";

const c_approve_conclusion = { approve: "同意", reject: "拒绝", uncertain: "不确定" };

//转化审批数据
export function convertApproveData(aiDataObj) {
  let dataSt = null;
  try {
    if (!isObject(aiDataObj) || !aiDataObj.conclusion || !aiDataObj.reason) return dataSt;
    if (!aiDataObj.conclusion || typeof aiDataObj.conclusion !== "string") return dataSt;
    if (aiDataObj.reason && typeof aiDataObj.reason === "object") return dataSt;
    let val = aiDataObj.conclusion.toLowerCase().trim();
    if (["approve", "reject", "uncertain"].includes(val)) {
      dataSt = {
        conclusion: val,
        conclusionDesc: c_approve_conclusion[val],
        reason: aiDataObj.reason ? String(aiDataObj.reason) : "",
        aiBsObj: aiDataObj.aiBsObj //业务数据
      };
    }
  } catch (e) {
    console.error("convertCollectData error:", e);
  }
  return dataSt;
}
