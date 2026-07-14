import upload from "./upload.vue";
import uploadExcel from "./uploadExcel.vue";
import { createVNode, render } from "vue";

let ctx;

/**
 * 上传组件
 *  @param {Object}  updParams:{
 *    limit: 1, //最大上传文件数
 *    fileSize: undefined, //文件大小-KB
 *    dimension: [],  //尺寸[宽-最小，宽-最大，高-最小，高-最大]
 *    accept: "", //上传文件类型 如: ".xls,.xlsx"
 *    acceptTxt: "", //提示信息
 *    extensions: [], //文件后缀
 *    uploadUrl: "", //上传地址
 *    fileCate: "", //附件类别-根目录
 *    filePath: "", //文件路径
 *    bussId: "", //业务id
 *    custParam: {}, //自定义参数
 *    showMsgBox: true, //显示消息
 *    listType: "text", //文件列表的类型
 *    TMCode: "", //下载模版
 *    title:"",//窗口名称
 *    dialogWidth: 400, //窗口宽度
 *    dialogHeight: 450, //窗口高度
 *    //压缩图片
 *    compress: {
 *      compress: false, //是否压缩
 *      fileSize: 1024,  //超过多大进行压缩KB
 *      quality: 0.8, //压缩质量
 *      widthMax: 1600, //压缩最大宽度
 *      widthMin: 100   //压缩最小宽度
 *    }
 * }
 * @return {Promise} 返回参数说明
 * [{
 *    light 指示灯	Number、String	枚举：1.红灯 2.黄灯 3.绿灯 其它灰灯
 *    retCode 错误代码	string
 *    retMsg 错误消息	string
 *    bussId 业务id	String
 *    fileName 文件名	String
 *    filePath 文件路径	String
 * }]
 */
export function szdUpload(updParams) {
  return new Promise(resolve => {
    let resolveFlag = false;
    const div = document.createElement("div");
    const vNode = createVNode(upload, {
      updParams: updParams,
      onUploadResult: res => {
        resolve(res);
        resolveFlag = true;
      },
      onCloseDialog: () => {
        if (!resolveFlag) {
          resolve(false);
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
 * 上传Excel组件-可选
 *  @param {Object}  updParams:{
 *     acceptTxt: "", //提示信息-可选
 *     TMCode: "", //下载模板-可选
 *     fileName: "", //下载文件名-可选
 *     title: "", //标题-可选
 *     dialogWidth: 300, //窗口宽度-可选
 *     dialogHeight: 300, //窗口高度-可选
 *     showData: false, //显示数据
 *     showIndex: false //显示数据时显示行号
 * }
 *
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
 *
 * @param {Array} sheets 多页签数据[下载模板使用]-可选
 * [{
 *  name:sheet页签名称-必输,
 *  keys:[字段1，字段2，字段3]-必输
 *  data:[{字段1:,字段2:,字段3},{字段1:,字段2:,字段3}]-必输
 * }]
 * @return {Promise} 返回参数-导入的数据
 */
export function szdUploadExcel(updParams = {}, fCats = [], sheets = []) {
  return new Promise(resolve => {
    let resolveFlag = false;
    const div = document.createElement("div");
    const vNode = createVNode(uploadExcel, {
      updParams: updParams,
      fCats: fCats,
      sheets: sheets,
      onUploadResult: res => {
        resolve(res);
        resolveFlag = true;
      },
      onCloseDialog: () => {
        if (!resolveFlag) {
          resolve(false);
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
const setShUpload = function(app) {
  ctx = app._context;
};

export default setShUpload;
