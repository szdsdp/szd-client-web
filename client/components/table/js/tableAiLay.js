//初始化aiLay
export function initAiLay(lay) {
  let aiParam = lay.layout.aiParam || {};
  let aiLay = {
    layout: {
      routerCode: aiParam.routerCode || lay.layout.report || "",
      groupCode: aiParam.groupCode || "", //会话组代码
      showPage: aiParam.showPage !== false, //显示分页
      collectMode: ["0", "1", "2"].includes(aiParam.collectMode) ? aiParam.collectMode : "1" //0.不采集, 1.组件处理采集 2.回调处理采集
    },
    aiFst: []
  };
  let domList = [];
  for (let key in lay.fCatUse) {
    const fCat = lay.fCatUse[key];
    if (["svg", "hlt", "upload", "button"].includes(fCat.type)) continue;
    let domItem = {
      objType: "F", //A.结构 B.表 F.字段
      fieldCode: fCat.field, //字段代码
      fieldName: fCat.label, //字段名称
      fieldType: fCat.type, //数据类型
      fieldFst: fCat.edit ? (fCat.required ? "2" : "1") : "3", //字段状态 1.可选 2.必输 3.显示
      fieldPk: fCat.isPk === true //主键
    };
    if (fCat.ctrlParam?.maxlength) domItem.fieldLen = fCat.ctrlParam.maxlength; //字段长度
    if (fCat.numDec !== undefined && fCat.numDec !== null) domItem.fieldDec = fCat.numDec; //小数位
    //搜索帮助
    if (fCat.ctrlParam?.baseField && ["input", "select", "radio"].includes(fCat.ctrlType)) {
      domItem.fieldHelpType = fCat.ctrlType === "input" ? "A" : "B"; //帮助类型 A.搜索帮助 B.下拉框
      domItem.fieldHelpCode = fCat.ctrlParam.baseField; //帮助基础字段
      if (domItem.fieldHelpType === "A" && fCat.ctrlParam.baseMapping) {
        for (let i = 0; i < fCat.ctrlParam.baseMapping.length; i++) {
          const bMp = String(fCat.ctrlParam.baseMapping[i] || "").split("-");
          if (bMp[0] === fCat.field) {
            domItem.fieldHelpMap = bMp.length > 1 ? bMp[1] : bMp[0];
            break;
          }
        }
      }
    }
    domList.push(domItem);
  }
  aiLay.aiFst.push({ objType: "B", domList: domList });
  return aiLay;
}
