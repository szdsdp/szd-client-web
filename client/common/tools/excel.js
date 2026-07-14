import * as XLSX from "xlsx-js-style";
import { $m } from "../utils/globalConfig";
import sDate from "./date";
import { excelExport, excelTmpExport, excelUpload } from "../../components/table/js/TableExcel";

/**
 * 导出数据-表格id方式
 * @param {String} tableId 表格id
 * @param {String} fileName 导出文件名
 */
function exportDataById(tableId, fileName = "") {
  if (!tableId) return;
  const table = document.getElementById(tableId);
  if (!table) {
    $m("CORE_CLIENT.W011"); //无需要导出的数据
    return;
  }
  const wb = XLSX.utils.table_to_book(table, { raw: true });
  let _fileName = fileName ? fileName : sDate.format(undefined, "YYYYMMDDHHmmss") + ".xlsx";
  if (!_fileName.toLowerCase().endsWith(".xlsx") && !_fileName.toLowerCase().endsWith(".xls")) {
    _fileName = _fileName + ".xlsx";
  }
  XLSX.writeFile(wb, _fileName);
}

/**
 * 导出数据-表头参数方式
 * @param {Array} fCats 表头参数
 * [{
 *  field:列字段,
 *  label:列名称,
 *  type:数据类型-可选["string", "number", "boolean", "date", "datetime", "time", "year", "month"],
 *  numDot:千分位符-可选,
 *  numDec:小数位位数-可选,
 *  doSum: 列汇总-可选 0.不汇总 1.合计 2.平均值 3.最小值 4.最大值 5.统计行数
 *  exportSplit:数据导出分割符-可选,
 *  children:[{同fCatCol参数}]  //多表头-可选
 * }]
 * @param {Array} rows 需要导出的数据
 * @param {String} fileName 导出文件名-可选
 * @param {Array} sheets 多页签数据-可选
 * [{
 *  name:sheet页签名称-必输,
 *  keys:[字段1，字段2，字段3]-必输
 *  data:[{字段1:,字段2:,字段3},{字段1:,字段2:,字段3}]-必输
 * }]
 */
function exportData(fCats, rows, fileName = "", sheets = []) {
  let lay = {
    layout: { impTmpName: fileName },
    fCatCol: fCats
  };
  excelExport(lay, rows, sheets);
}

/**
 * 导出模板
 * @param {Array} fCats 表头参数
 * [{
 *  field:列字段,
 *  label:列名称,
 *  type:数据类型-可选["string", "number", "boolean", "date", "datetime", "time", "year", "month"],
 *  numDec:小数位位数-可选,
 *  required: 必输-可选,
 *  importSplit: 数据分割符-可选,
 *  children:[{同fCatCol参数}]  //多表头-可选
 * }]
 * @param {String} TMCode 模板代码-可选
 * @param {String} fileName 导出文件名-可选
 * @param {Array} sheets 多页签数据-可选
 * [{
 *  name:sheet页签名称-必输,
 *  keys:[字段1，字段2，字段3]-必输
 *  data:[{字段1:,字段2:,字段3},{字段1:,字段2:,字段3}]-必输
 * }]
 */
function exportTemplate(fCats = [], TMCode = "", fileName = "", sheets = []) {
  let lay = {
    layout: { impTmpCode: TMCode, impTmpName: fileName },
    fCatCol: fCats
  };
  excelTmpExport(lay, sheets);
}

/**
 * 上传数据
 * @param {Array} fCats 表头参数
 * [{
 *  field:列字段,
 *  label:列名称,
 *  type:数据类型-可选["string", "number", "boolean", "date", "datetime", "time", "year", "month"],
 *  numDec:小数位位数-可选,
 *  required: 必输-可选,
 *  importSplit: 数据分割符-可选,
 *  children:[{同fCatCol参数}]  //多表头-可选
 * }]
 * @param {Array} rows 接收数据对象
 * @param {File} file 文件流
 */
function uploadData(fCats, rows, file) {
  return new Promise(resolve => {
    let lay = {
      layout: {},
      fCatCol: fCats,
      fCatUse: {}
    };
    getFCatUse(fCats, lay.fCatUse);
    excelUpload(lay, rows, file).then(res => {
      resolve(res);
    });
  });
}

// 获取可用列
function getFCatUse(fCats, fCatUse) {
  for (let i = 0; i < fCats.length; i++) {
    let item = fCats[i];
    if (item && item.children && item.children.length > 0) {
      getFCatUse(item.children, fCatUse);
    } else if (item.field) {
      fCatUse[item.field] = {
        field: item.field,
        label: item.label,
        type: item.type && ["string", "number", "boolean", "date", "datetime", "time", "year", "month"].includes(item.type) ? item.type : "string",
        numDec: item.numDec,
        required: item.required,
        importSplit: item.importSplit,
        $SZDCol: true
      };
    }
  }
}

const szdExcel = {
  exportDataById,
  exportData,
  exportTemplate,
  uploadData
};

export default szdExcel;
