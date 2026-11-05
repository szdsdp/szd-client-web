import _ from "lodash";
import { isObject } from "./aiChatInit";
import { c_boolean_no, c_boolean_yes } from "./aiChatResultCollect";

//转化Skill数据
export function convertSkillData(aiDataObj) {
  let dataSt = [];
  try {
    if (!aiDataObj || typeof aiDataObj !== "object") return dataSt;
    let skillList = Array.isArray(aiDataObj) ? aiDataObj : [aiDataObj];
    for (let i = 0; i < skillList.length; i++) {
      const item = skillList[i];
      if (!isObject(item) || (!item.skillCode && !item.routerCode && !item.skillSql)) continue;
      let st = {
        itemNo: i + 1,
        skillCode: item.skillCode || "",
        skillName: item.skillName || "",
        routerCode: item.routerCode || "",
        routerName: item.routerName || "",
        skillDesc: item.skillDesc || "",
        skillSql: item.skillSql || "",
        apiMethod: item.apiMethod,
        sqlSchema: item.sqlSchema || "",
        page: {
          pageAct: item.pageAct === true,
          pageSizeMax: item.pageSizeMax || 0,
          pageSizes: item.pageSizes && item.pageSizes.length > 0 ? item.pageSizes : [100, 200, 500],
          pageNum: 1,
          pageSize: 100,
          total: 0
        },
        inputParamList: item.inputParamList,
        skillParams: _.cloneDeep(item.skillParams),
        skillParamsJs: _.cloneDeep(item.skillParams),
        reason: item.reason || ""
      };
      st.page.pageSize = st.page.pageSizes[0];
      //检查数据
      if (item.inputParamList && item.inputParamList.length > 0) {
        if (!isObject(st.skillParamsJs)) st.skillParamsJs = {};
        for (let j = 0; j < item.inputParamList.length; j++) {
          const inputParam = item.inputParamList[j];
          if (inputParam.fieldRange) {
            if (!isObject(st.skillParamsJs.ranges)) st.skillParamsJs.ranges = {};
            convertSkillDataRange(inputParam, st.skillParamsJs.ranges);
          } else {
            convertSkillDataParam(inputParam, st.skillParamsJs, inputParam.fieldCode);
          }
        }
      } else {
        item.inputParamList = [];
      }

      dataSt.push(st);
    }
  } catch (e) {
    console.error("convertCollectData error:", e);
  }
  return dataSt;
}

//数据值Range处理
export function convertSkillDataRange(inputParam, skillRanges) {
  if (!Array.isArray(skillRanges[inputParam.fieldCode])) skillRanges[inputParam.fieldCode] = [];
  //处理ranges值
  for (let k = 0; k < skillRanges[inputParam.fieldCode].length; k++) {
    let itemRange = skillRanges[inputParam.fieldCode][k];
    //数据类型
    itemRange.type = inputParam.fieldType || "string";
    //数据值
    convertSkillDataParam(inputParam, itemRange, "low");
    if (itemRange.type !== "boolean") {
      convertSkillDataParam(inputParam, itemRange, "high");
    } else {
      itemRange.high = null;
    }
    //操作符
    if (itemRange.high) {
      itemRange.option = ["BT", "NB"].includes(itemRange.option) ? itemRange.option : "BT";
    } else {
      if (!["EQ", "NE", "GE", "LE", "GT", "LT", "SP", "NS", "CP", "NC", "EN", "NN"].includes(itemRange.option)) {
        itemRange.option = itemRange.low && typeof itemRange.low === "string" && itemRange.low.includes("*") ? "CP" : "EQ";
      }
    }
  }
}

//数据值处理
export function convertSkillDataParam(inputParam, skillParams, fieldCode) {
  let val = skillParams[fieldCode];
  if (inputParam.fieldType === "boolean") {
    if (typeof val === "string") val = val.toLowerCase().trim();
    if (c_boolean_yes.includes(val)) {
      skillParams[fieldCode] = true;
    } else if (c_boolean_no.includes(val)) {
      skillParams[fieldCode] = false;
    } else {
      skillParams[fieldCode] = null;
    }
  } else if (inputParam.fieldType === "number") {
    if (val) {
      if (typeof val === "string") val = val.trim();
      if (val !== null && val !== undefined && val !== "" && !isNaN(Number(val))) {
        skillParams[fieldCode] = Number(val);
      } else {
        skillParams[fieldCode] = null;
      }
    }
  } else if (["date", "datetime", "month", "year", "time"].includes(inputParam.fieldType)) {
    if (val) {
      if (typeof val === "string" || typeof val === "number") {
        let str = String(val).trim();
        let d = new Date(str);
        if (!isNaN(d.getTime())) {
          skillParams[fieldCode] = str;
        }
      } else {
        skillParams[fieldCode] = null;
      }
    }
  } else {
    if (val) {
      if (typeof val === "string" || typeof val === "number") {
        skillParams[fieldCode] = String(val);
      } else {
        skillParams[fieldCode] = "";
      }
    }
  }
}
