import { isObject } from "./aiChatInit";
import { $mE } from "../../../common/utils/globalConfig";

export const c_fieldType = ["string", "number", "boolean", "date", "datetime", "month", "year", "time"];
export const c_boolean_yes = ["true", true, 1, "1", "是", "y", "yes", "on", "enabled", "ok", "okay", "确定", "确认", "confirm"];
export const c_boolean_no = ["false", false, 0, "0", "否", "n", "no", "off", "disabled", "not", "cancel", "取消", "拒绝", "reject"];

/**
 * 生成采集DOM
 * 转换为结构化的DOM节点列表，支持对象(A)、表格(B)、字段(F)三种节点类型
 **/
export function convertCollectDOM(aiFst, isFirst = false) {
  let domList = [];
  try {
    //Dom是否是数组
    if (!aiFst || !Array.isArray(aiFst) || aiFst.length === 0) return domList;
    //转换Dom信息
    for (let i = 0; i < aiFst.length; i++) {
      const item = aiFst[i];
      if (!["A", "B", "F"].includes(item.objType) && !item.fieldCode) continue;
      //首层字段为空，类型为B时，且只能存在一行数据
      if (!item.fieldCode) {
        if (!(isFirst && item.objType === "B" && aiFst.length === 1)) {
          $mE("数据结构维护错误,首层字段为空，类型为B时，且只能存在一行数据");
          continue;
        }
      }
      //处理容器类型节点（A-对象结构 / B-表格结构），递归解析子节点
      if (item.objType && ["A", "B"].includes(item.objType)) {
        let childDomList = convertCollectDOM(item.domList);
        if (childDomList.length > 0) {
          let domItem = {
            objType: item.objType,
            objDesc: item.objDesc || item.fieldDesc || item.fieldName || item.fieldCode || "",
            fieldCode: item.fieldCode || "", //首层为空直接为表或结构
            fieldName: item.fieldName || item.fieldCode || "",
            domList: childDomList
          };
          domList.push(domItem);
        }
      } else if (item.fieldCode && ["1", "2"].includes(item.fieldFst)) {
        //处理叶子字段节点
        let domItem = {
          objType: item.objType || "F",
          objDesc: item.objDesc || "",
          fieldCode: item.fieldCode,
          fieldName: item.fieldName || item.fieldCode,
          fieldType: c_fieldType.includes(item.fieldType) ? item.fieldType : "string",
          fieldLen: item.fieldLen,
          fieldDec: item.fieldDec,
          fieldFst: item.fieldFst,
          fieldDesc: item.fieldDesc || "",
          fieldPk: item.fieldPk === true,
          fieldHelpType: ["A", "B"].includes(item.fieldHelpType) && item.fieldHelpCode ? item.fieldHelpType : "",
          fieldHelpCode: ["A", "B"].includes(item.fieldHelpType) && item.fieldHelpCode ? item.fieldHelpCode : "",
          fieldHelpCate: ["A", "B"].includes(item.fieldHelpType) && item.fieldHelpCode ? item.fieldHelpCate : "", //基础字段类型：0.基础字段 1.搜索帮助集 2.数据字典
          fieldHelpMap: ["A", "B"].includes(item.fieldHelpType) && item.fieldHelpCode ? item.fieldHelpMap : "",
          fieldHelpEnum: ["A", "B"].includes(item.fieldHelpType) && item.fieldHelpCode ? item.fieldHelpEnum : "" //数据字典枚举值
        };
        domList.push(domItem);
      }
    }
  } catch (e) {
    console.error("convertCollectDOM error:", e);
  }
  return domList;
}

/**
 * 转化采集数据
 **/
export function convertCollectData(dataJs, domList, isFirst = false) {
  let dataSt = null;
  //初始化对象
  if (!dataJs || !Array.isArray(domList) || domList.length === 0) return dataSt;
  if (!domList[0].fieldCode) {
    if (isFirst && domList[0].objType === "B" && domList.length === 1) {
      dataSt = [];
    } else {
      return dataSt;
    }
  } else {
    dataSt = {};
  }
  //处理数据
  try {
    for (let i = 0; i < domList.length; i++) {
      const domItem = domList[i];
      //字段为空，直接为表格
      if (!domItem.fieldCode) {
        if (isFirst && domItem.objType === "B" && Array.isArray(dataJs) && dataJs.length > 0) {
          for (let j = 0; j < dataJs.length; j++) {
            if (!isObject(dataJs[j])) continue;
            let itemStObj = convertCollectData(dataJs[j], domItem.domList);
            if (isObject(itemStObj)) dataSt.push(itemStObj);
          }
        }
        break;
      }
      //处理数据
      if (!isObject(dataJs)) break;
      const valJs = dataJs[domItem.fieldCode];
      if (domItem.objType === "A") {
        //结构数据
        dataSt[domItem.fieldCode] = {};
        if (isObject(valJs)) {
          dataSt[domItem.fieldCode] = convertCollectData(valJs, domItem.domList);
        }
      } else if (domItem.objType === "B") {
        //表格数据
        dataSt[domItem.fieldCode] = [];
        if (valJs && Array.isArray(valJs) && valJs.length > 0) {
          for (let j = 0; j < valJs.length; j++) {
            if (!isObject(valJs[j])) continue;
            let itemStObj = convertCollectData(valJs[j], domItem.domList);
            if (isObject(itemStObj)) dataSt[domItem.fieldCode].push(itemStObj);
          }
        }
      } else {
        //字段数据
        if (valJs === null || valJs === undefined || typeof valJs === "object") continue;
        if (domItem.fieldType === "boolean") {
          let val = valJs;
          if (typeof val === "string") val = val.toLowerCase().trim();
          if (c_boolean_yes.includes(val)) {
            dataSt[domItem.fieldCode] = true;
          } else if (c_boolean_no.includes(val)) {
            dataSt[domItem.fieldCode] = false;
          }
        } else if (domItem.fieldType === "number") {
          let val = valJs;
          if (typeof val === "string") val = val.trim();
          if (val !== null && val !== undefined && val !== "" && !isNaN(Number(val))) {
            dataSt[domItem.fieldCode] = Number(val);
          }
        } else if (["date", "datetime", "month", "year", "time"].includes(domItem.fieldType)) {
          let val = valJs;
          if (typeof val === "string" || typeof val === "number") {
            let str = String(val).trim();
            let d = new Date(str);
            if (!isNaN(d.getTime())) {
              dataSt[domItem.fieldCode] = str;
            }
          }
        } else {
          let val = valJs;
          if (typeof val === "string" || typeof val === "number") {
            dataSt[domItem.fieldCode] = String(val);
          }
        }
      }
    }
  } catch (e) {
    console.error("convertCollectData error:", e);
  }
  return dataSt;
}

/**
 * 是否可采集确认
 **/
export function isCollectConfirm(dataSt, domList) {
  if (domList?.length > 0 && dataSt) {
    for (let i = 0; i < domList.length; i++) {
      const domItem = domList[i];
      let val = domItem.fieldCode ? dataSt[domItem.fieldCode] : dataSt;
      if (domItem.objType === "A") {
        if (isObject(val)) {
          for (let key in val) {
            if (val[key]) return true;
          }
        }
      } else if (domItem.objType === "B") {
        if (val && Array.isArray(val) && val.length > 0) return true;
      } else {
        if (val) return true;
      }
    }
  }
  return false;
}

/**
 * 采集数据处理
 */
export function processDataCollect(bsDataObj, dataSt, domList) {
  if (!domList || domList.length === 0 || !dataSt) return;
  if (!bsDataObj.value) {
    if (domList[0].objType === "B" && !domList[0].fieldCode) {
      if (!Array.isArray(dataSt) || dataSt.length === 0) return;
      bsDataObj.value = [];
    } else {
      if (!isObject(dataSt)) return;
      bsDataObj.value = {};
    }
  }

  try {
    for (let i = 0; i < domList.length; i++) {
      let domItem = domList[i];
      //表格赋值
      if (!domItem.fieldCode) {
        if (domItem.objType === "B") {
          if (!Array.isArray(dataSt) || dataSt.length === 0) return;
          if (!Array.isArray(bsDataObj.value)) return;
          processDataCollectB(bsDataObj.value, dataSt, domItem.domList);
        }
        return;
      }
      //赋值
      if (domItem.objType === "A") {
        if (!isObject(dataSt[domItem.fieldCode])) continue;
        if (!bsDataObj.value[domItem.fieldCode]) bsDataObj.value[domItem.fieldCode] = {};
        if (typeof bsDataObj.value[domItem.fieldCode] === "object" && !Array.isArray(bsDataObj.value[domItem.fieldCode])) {
          processDataCollectA(bsDataObj.value[domItem.fieldCode], dataSt[domItem.fieldCode], domItem.domList);
        }
      } else if (domItem.objType === "B") {
        if (!Array.isArray(dataSt[domItem.fieldCode]) || dataSt[domItem.fieldCode].length === 0) continue;
        if (!bsDataObj.value[domItem.fieldCode]) bsDataObj.value[domItem.fieldCode] = [];
        if (Array.isArray(bsDataObj.value[domItem.fieldCode])) {
          processDataCollectB(bsDataObj.value[domItem.fieldCode], dataSt[domItem.fieldCode], domItem.domList);
        }
      } else {
        processDataCollectMove(bsDataObj.value, dataSt, domItem.fieldCode);
      }
    }
  } catch (e) {
    $mE("数据采集过程出错,数据结构或类型不一致");
    console.error("processDataCollect error:", e);
  }
}
//结构赋值
function processDataCollectA(dataBsObj, dataStObj, domList) {
  for (let i = 0; i < domList.length; i++) {
    let domItem = domList[i];
    if (domItem.objType === "A") {
      if (!isObject(dataStObj[domItem.fieldCode])) continue;
      if (!dataBsObj[domItem.fieldCode]) dataBsObj[domItem.fieldCode] = {};
      if (typeof dataBsObj[domItem.fieldCode] === "object" && !Array.isArray(dataBsObj[domItem.fieldCode])) {
        processDataCollectA(dataBsObj[domItem.fieldCode], dataStObj[domItem.fieldCode], domItem.domList);
      }
    } else if (domItem.objType === "B") {
      if (!Array.isArray(dataStObj[domItem.fieldCode]) || dataStObj[domItem.fieldCode].length === 0) continue;
      if (!dataBsObj[domItem.fieldCode]) dataBsObj[domItem.fieldCode] = [];
      if (Array.isArray(dataBsObj[domItem.fieldCode])) {
        processDataCollectB(dataBsObj[domItem.fieldCode], dataStObj[domItem.fieldCode], domItem.domList);
      }
    } else {
      processDataCollectMove(dataBsObj, dataStObj, domItem.fieldCode);
    }
  }
}
//表数据赋值
function processDataCollectB(dataBsList, dataStList, domList) {
  if (!dataBsList || !Array.isArray(dataBsList) || !dataStList || !Array.isArray(dataStList) || dataStList.length === 0) return;
  //查找主键字段
  let pkArr = [];
  for (let i = 0; i < domList.length; i++) {
    if (domList[i].fieldPk === true) pkArr.push(domList[i].fieldCode);
  }
  //循环赋值数据
  for (let i = 0; i < dataStList.length; i++) {
    let itemSt = dataStList[i];
    let itemBs = {};
    let updFlag = false;
    //查找相同主键行，没有进行新增数据
    if (pkArr.length > 0) {
      for (let j = 0; j < dataBsList.length; j++) {
        const _itemBsTemp = dataBsList[j];
        let matchFlag = true;
        for (let k = 0; k < pkArr.length; k++) {
          if (_itemBsTemp[pkArr[k]] !== itemSt[pkArr[k]]) {
            matchFlag = false;
            break;
          }
        }
        if (matchFlag) {
          itemBs = _itemBsTemp;
          updFlag = true;
          break;
        }
      }
    }
    //数据赋值
    processDataCollectA(itemBs, itemSt, domList);
    //新增行数据
    if (updFlag === false) dataBsList.push(itemBs);
  }
}

//数据赋值
function processDataCollectMove(dataBs, dataSt, fieldCode) {
  let val = dataSt[fieldCode];
  if (val === null || val === undefined || val === 0 || val === "") return false;

  if (dataBs[fieldCode] !== null && dataBs[fieldCode] !== undefined) {
    if (typeof dataBs[fieldCode] === "object") return false;
    if (typeof dataBs[fieldCode] === "number") {
      if (typeof val !== "number" && typeof val !== "string") return false;
      if (isNaN(Number(val))) return false;
    }
  }
  dataBs[fieldCode] = val;
}
