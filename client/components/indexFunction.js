//搜索帮助
import setShApp, { szdSh, szdShShow } from "./searchHelp/serchHelp";
//消息提醒
import setMsgBox, { szdMsgBox } from "./msgBox/msgBox";
//iframe弹窗
import { szdIfrDg } from "./ifrDg/ifrDg.js";
//打印模板
import setPrtTemplate, { szdPrtBussId, szdPrtRouter, szdPrtRouterDg } from "./printTemplate/printTemplate";
//上传文件
import setShUpload, { szdUpload, szdUploadExcel } from "./upload/upload";
//文件预览
import setFileView, { szdFileView } from "./fileView/fileView";
//TR请求
import setTr, { szdTr } from "./tr/tr";

const installComponentFunction = app => {
  //搜索帮助
  setShApp(app);
  app.config.globalProperties.szdSh = szdSh;
  app.config.globalProperties.szdShShow = szdShShow;
  //消息提醒
  setMsgBox(app);
  app.config.globalProperties.szdMsgBox = szdMsgBox;
  //iframe弹窗
  app.config.globalProperties.szdIfrDg = (routerCode, params = {}) => {
    szdIfrDg.apply(app, [routerCode, params]).then();
  };
  //打印模板
  setPrtTemplate(app);
  app.config.globalProperties.szdPrtBussId = szdPrtBussId;
  app.config.globalProperties.szdPrtRouter = szdPrtRouter;
  app.config.globalProperties.szdPrtRouterDg = szdPrtRouterDg;
  //上传文件
  setShUpload(app);
  app.config.globalProperties.szdUpload = szdUpload;
  app.config.globalProperties.szdUploadExcel = szdUploadExcel;
  //文件预览
  setFileView(app);
  app.config.globalProperties.szdFileView = szdFileView;
  //TR请求
  setTr(app);
  app.config.globalProperties.szdTr = szdTr;
};

export default installComponentFunction;
