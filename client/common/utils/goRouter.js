import router from "@/router";
import szdStoreSession from "../store/storeSession";
import store from "~store";
import { createVNode, render } from "vue";
import { $m } from "./globalConfig";
import { szdIfrDg } from "../../components/ifrDg/ifrDg.js";
import { szdPrtRouter, szdPrtRouterDg } from "../../components/printTemplate/printTemplate";
import qiankunMicro from "../qiankun/qiankunMicro";
import qs from "qs";

//系统代码
const SYS_CODE = process.env.VUE_APP_SYS_CODE;

/**
 * 获取路由代码
 * @param {Object} _route 路由对象(默认当前路由)
 * @return {String} 返回路由代码
 */
function getRouterCode(_route = undefined) {
  const currentRoute = _route ? _route : router.currentRoute.value;
  let rCode = currentRoute.name;
  if (["micro", "dest"].includes(currentRoute.name) && currentRoute.params.chapters && currentRoute.params.chapters.length > 0) {
    rCode = currentRoute.params.chapters[0];
  }
  return rCode ? rCode.toUpperCase() : "";
}

/**
 * 获取路由代码-根据路径
 * @param {String} path 路由代码
 * @return {String} 返回路由代码
 */
function getRouterCodePath(path) {
  let ls_route = undefined;
  const routesObj = szdStoreSession.getCoreLogin().routesObj;
  for (let key in routesObj) {
    if (routesObj[key].path === path.toLowerCase()) {
      ls_route = routesObj[key];
      break;
    }
  }
  return ls_route ? ls_route.routerCode : "";
}

/**
 * 获取路由对象
 * @param {String} routerCode 路由代码
 * @return {Object} 返回路由对象
 */
function getRouterObj(routerCode) {
  if (routerCode) {
    routerCode = routerCode.toUpperCase();
    const routerObj = szdStoreSession.getCoreLogin().routesObj[routerCode];
    if (routerObj) {
      return routerObj;
    } else {
      if (SYS_CODE === "CORE") {
        $m("CORE_CLIENT.E022", routerCode); //路由代码 & 不存在或无权限
      } else {
        $m("CORE_CLIENT.E023", routerCode); //路由代码 & 不存在、或无权限、或未在微应用框架内访问
      }
    }
  } else {
    $m("CORE_CLIENT.E020", routerCode); //路由代码不能为空
  }
  return null;
}

/**
 * 路由跳转或弹窗页面
 * @param {String} routerCode 路由代码
 * @param {Object} params 地址参数
 * @param {Object} mode 导航模式 prt 打印  dialog 弹窗打开 blank 新窗口
 */
export function goNav(routerCode, params = {}, mode = { prt: false, dialog: false, blank: false }) {
  if (!routerCode) {
    $m("CORE_CLIENT.E020", routerCode); //路由代码不能为空
    return;
  }
  routerCode = routerCode.toUpperCase();
  //检查和获取路由对象
  const routerObj = getRouterObj(routerCode);
  if (!routerObj) return;
  //检查路由信息
  if (!routerObj.path) {
    $m("CORE_CLIENT.E024", routerCode); //路由 & 地址不存在
    return;
  }
  //跳转打印路由
  if (mode.prt) {
    szdPrtRouter(routerCode, params).then();
    return;
  }

  //是否弹出新的页签
  if (routerObj.isAutoBlank === true) {
    let visitedViews = store.state.frameTag.visitedViews;
    if (window.__POWERED_BY_QIANKUN__ && SYS_CODE !== "CORE") {
      if (visitedViews && visitedViews.includes(routerCode)) {
        mode.blank = true;
      }
    } else {
      if (visitedViews.find(r => r.name === routerCode || (r.meta && r.meta.name === routerCode))) {
        mode.blank = true;
      }
    }
  }

  //检查是否为微应用调用其他应用
  if (SYS_CODE !== "CORE" && routerObj.sysCodeWeb !== SYS_CODE) {
    qiankunMicro.setGlobalState({
      handle: "coreGoNav",
      szdMircoProps: { routerCode: routerCode, params: params, mode: mode }
    });
    return;
  }

  //4.弹窗打开
  if (routerObj.isFrame === "4" || mode.dialog) {
    szdIfrDg(routerCode, params).then();
    return;
  }

  //打开应用
  if (routerObj.isBlank || mode.blank) {
    const fullPath = getFullPath(routerObj.path, params); //全路径
    switch (routerObj.isFrame) {
      case "3": //新标签(无框架，路由唯一)  新窗口名称与当前窗口名称一致，当前窗口将被覆盖,当前窗口获取是 window.name
        window.open(fullPath, routerObj.routerCode);
        break;
      case "9": //新标签(外链)
        const url = routerObj.destCode == null || routerObj.destCode === "" ? routerObj.routerCode : routerObj.compUrl;
        window.open(url, "_blank");
        break;
      default:
        window.open(fullPath, "_blank");
        break;
    }
  } else {
    if (routerObj.path.includes("/:")) {
      router.push({ name: routerObj.name, params: params }).then();
    } else {
      if (window.__POWERED_BY_QIANKUN__ && SYS_CODE !== "CORE") {
        router.push({ path: routerObj.path.replace("/" + SYS_CODE.toLowerCase(), ""), query: params }).then();
      } else {
        router.push({ path: routerObj.path, query: params }).then();
      }
    }
  }
}

/**
 * 跳转弹窗页面
 * @param {String} routerCode 路由代码
 * @param {Object} params 地址参数
 * @param {Object} mode 导航模式 prt 打印
 */
export function goNavDg(routerCode, params = {}, mode = { prt: false }) {
  //检查和获取路由对象
  const routerObj = getRouterObj(routerCode);
  if (!routerObj) return null;

  //检查是否为微应用调用其他应用
  if (SYS_CODE !== "CORE" && routerObj.sysCodeWeb !== SYS_CODE) {
    qiankunMicro.setGlobalState({
      handle: "coreGoNavDg",
      szdMircoProps: { routerCode: routerCode, params: params, mode: mode }
    });
    return;
  }

  //打开应用
  if (mode.prt) {
    szdPrtRouterDg(routerCode).then(res => {
      if (res && res.routerCode) {
        if (res.routerCode === "CORE_SCP_03P") {
          params["program"] = res.program;
          szdIfrDg(res.routerCode, { print: btoa(JSON.stringify(params)) }).then();
        } else {
          szdIfrDg(res.routerCode, params).then();
        }
      }
    });
  } else {
    szdIfrDg(routerCode, params).then();
  }
}

/**
 * 零代码打印-程序
 * @param {Object,Array} params 打印参数
 * 数组：[{program:程序代码,bussId:值或者逗号分隔多值}]
 * 对象：{program:程序代码,bussId:值或者逗号分隔多值}
 */
function goNavPrt(params) {
  let print = [];
  if (Array.isArray(params)) {
    for (let i = 0; i < params.length; i++) {
      if (params[i].program && params[i].bussId) {
        const bArr = params[i].bussId.toString().split(",");
        for (let j = 0; j < bArr.length; j++) {
          print.push({ program: params[i].program, bussId: bArr[j] });
        }
      } else {
        $m("CORE_CLIENT.E109"); //打印程序和业务Id不能为空
        return;
      }
    }
  } else {
    if (params.program && params.bussId) {
      const bArr = params.bussId.toString().split(",");
      for (let j = 0; j < bArr.length; j++) {
        print.push({ program: params.program, bussId: bArr[j], test: params.test });
      }
    } else {
      $m("CORE_CLIENT.E109"); //打印程序和业务Id不能为空
      return;
    }
  }
  goNav("CORE_SCP_03P", { print: btoa(JSON.stringify(print)) });
}

/**
 * 获取路由的全路径
 * @param {String} routerCode 路由代码
 * @param {Object} params 地址参数
 * @return {String} 返回Url地址
 */
function goNavPath(routerCode, params = {}) {
  if (!routerCode) {
    $m("CORE_CLIENT.E020"); //路由代码不能为空
    return null;
  }
  routerCode = routerCode.toUpperCase();
  //检查和获取路由对象
  const routerObj = getRouterObj(routerCode);
  if (!routerObj) return null;
  //检查路由信息
  if (!routerObj.path) {
    $m("CORE_CLIENT.E024", routerCode); //路由 & 地址不存在
    return null;
  }
  //跳转路全路径
  return getFullPath(routerObj.path, params);
}

/**
 * 参数转换为Url全路径
 * @param {String} path 路径
 * @param {Object} params 地址参数
 */
function getFullPath(path, params) {
  let fullPath = path;
  if (Object.keys(params).length === 0) return fullPath;

  if (fullPath.includes("/:")) {
    const parArr = fullPath.split("/").filter(item => item.startsWith(":"));
    parArr.forEach(item => {
      const key = item.replace(":", "");
      fullPath = fullPath.replace(`:${key}`, encodeURIComponent(params[key]));
    });
  } else {
    const query = setUrlParams(params);
    if (query) {
      fullPath = fullPath + "?" + query;
    }
  }
  return fullPath;
}

/**
 * 解析Url参数
 */
function getUrlParams(query) {
  return qs.parse(query);
}

/**
 * 转换Url参数
 */
function setUrlParams(params) {
  return qs.stringify(params);
}

/**
 * 替换URL地址
 * @param {Object|String} params 地址参数
 * @param {Boolean} replaceState 替换方式 true不刷新页面，替换当前回退地址
 */
function replaceUrl(params, replaceState = true) {
  let urlPar = "";
  if (typeof params === "string") {
    urlPar = params;
  } else {
    for (let key in params) {
      if (params[key] === undefined) continue;
      if (!urlPar) {
        urlPar = key + "=" + params[key];
      } else {
        urlPar = urlPar + "&" + key + "=" + params[key];
      }
    }
  }
  let newUrl = `${window.location.origin}${window.location.pathname}`;
  if (urlPar) {
    newUrl = newUrl + "?" + urlPar;
  }
  if (replaceState) {
    window.history.replaceState(null, "", newUrl);
  } else {
    window.location.replace(newUrl);
  }
}

/**
 * 关闭当前页签
 */
function closeFrameTag() {
  let visitedViews = store.state.frameTag.visitedViews;
  if (visitedViews.length > 0) {
    if (window.__POWERED_BY_QIANKUN__ && SYS_CODE !== "CORE") {
      qiankunMicro.setGlobalState({
        handle: "coreNavTab",
        szdMircoProps: { event: "closeSelf", name: getRouterCode(), path: router.currentRoute.value.path, sysCodeWeb: SYS_CODE }
      });
    } else {
      for (let i = 0; i < visitedViews.length; i++) {
        if (router.currentRoute.value.path === visitedViews[i].path) {
          store.dispatch("frameTag/delView", visitedViews[i]).then(({ visitedViews }) => {
            const latestView = visitedViews.slice(-1)[0];
            if (latestView) {
              router.push(latestView.fullPath);
            } else {
              router.push("/");
            }
          });
          break;
        }
      }
    }
  } else {
    const routesObj = getRouterObj(router.currentRoute.value.name);
    if (routesObj && !routesObj.isLayout) {
      router.push("/");
    }
  }
}

/**
 * 动态加载路由
 * @param {Object} context 上下文
 * @param {String} routerCode 路由地址
 * @param {Object} params 参数
 * @param {String} renderId 挂载位置id
 * @param callback 回调方法
 */
function renderComp({ context, routerCode, params, renderId, callback }) {
  const routesObj = getRouterObj(routerCode);
  if (!routesObj || !routesObj.componentUrl) {
    $m("CORE_CLIENT.E022", routerCode); //路由代码 & 不存在或无权限
    return;
  }
  //动态挂载路由
  import(`@/modules/${routesObj.componentUrl}`).then(res => {
    const vNode = createVNode(res.default, {
      ...params,
      onCloseDialog: () => {
        if (callback) {
          callback();
        }
      }
    });
    vNode.appContext = context;
    render(vNode, document.querySelector("#" + renderId));
  });
}

const szdRouter = {
  getRouterCode,
  getRouterCodePath,
  getRouterObj,
  goNav,
  goNavDg,
  goNavPrt,
  goNavPath,
  getFullPath,
  getUrlParams,
  setUrlParams,
  replaceUrl,
  closeFrameTag,
  renderComp
};

export default szdRouter;
