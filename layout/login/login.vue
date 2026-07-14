<template>
  <div class="g-logBg" v-if="dg.configFlag">
    <template v-if="dg.configFlag && config.logo.status === '1'">
      <img class="u-logo" src="../../client/assets/image/logo.png" />
    </template>
    <template v-else-if="dg.configFlag && config.logo.status === '2'">
      <img class="u-logo" :src="config.logo.imgUrl" />
    </template>

    <!-- 多语言选择 -->
    <div class="login-top">
      <el-select v-model="dg.language" @change="handleChangeLanguage" style="width: 200px">
        <el-option :value="key" :label="val" v-for="(val, key) in langs" />
      </el-select>
    </div>

    <!-- 主屏幕区 -->
    <div class="login-main" :class="{ flexCenter: dg.isMobile }">
      <div class="login-wrapper" id="logPos">
        <h3 class="login-main-title">{{ tranLanguage("用户登录") }}</h3>
        <div class="login-content">
          <!-- 用户名密码 -->
          <login-user :config="config" :mDg="dg" :bindThird="bindThird" @loginResult="loginResult" />
        </div>
      </div>
    </div>

    <!--  底部  -->
    <div class="el-login-footer">
      <div v-if="authMsg" class="footer-text">{{ authMsg }}</div>
      <div v-if="dg.configFlag" class="footer-text">{{ config.version }}</div>
    </div>

    <!-- 修改密码 -->
    <loginPwd ref="refLoginPwd" :config="config" :mDg="dg" />
    <!-- 已登录用户 -->
    <loginUserLogged ref="refLoginUserLogged" :config="config" :mDg="dg" @loginReload="loginReload" />
  </div>
</template>

<script setup>
  import { onBeforeMount, ref } from "vue";
  import { ElMessage } from "element-plus";
  import szdStoreCookie from "../../client/common/store/storeCookie";
  import szdStoreLocal from "../../client/common/store/storeLocal";
  import szdStoreSession from "../../client/common/store/storeSession";
  import { getLoginConfig, getSvg } from "../../client/common/api/login";
  import loginUser from "./loginUser.vue";
  import bgPic from "../../client/assets/image/loginBg.jpg";
  import mainBgPic from "../../client/assets/image/loginImg.png";
  import LoginUserLogged from "./loginUserLogged.vue";
  import LoginPwd from "./loginPwd.vue";
  //子屏幕
  const refLoginPwd = ref();
  const refLoginUserLogged = ref();
  //窗口参数
  const dg = ref({
    loginType: "A", //登录类型
    language: "",
    isMobile: false, //设备类型
    configFlag: false, //获取配置
    userId: ""
  });
  //多语言选择
  const langs = ref({});
  //配置参数
  const config = ref({
    logo: { status: "1", fileName: "", imgUrl: "" }, //LOGO图片显示
    bg: { status: "1", fileName: "", imgUrl: "" }, //背景图片显示
    bgon: { status: "1", fileName: "", imgUrl: "" }, //背景上层图片显示
    favicon: { status: "1", fileName: "", imgUrl: "" }, //favicon图片显示
    version: "河北尚智得信息技术有限公司版权所有", //版权信息
    loginTypes: ["A"], //登录方式
    captcha: true, //启用验证码
    langTxt: {}, //多语言文本
    pwdTip: "" //密码复杂度
  });
  //背景图片
  const loginBg = ref(`url(${bgPic})`);
  //背景上层图片
  const loginMainBg = ref(`url(${mainBgPic})`);
  //授权信息
  const authMsg = ref("");
  //三方登录
  const bindThird = ref({
    appOpenUuid: "", //三方系统绑定uuid
    routerCode: "",
    params: {}
  });
  //初始化参数
  onBeforeMount(() => {
    getCookie();
    getDevice();
    getConfig();
  });

  //Cookie信息
  const getCookie = () => {
    dg.value.language = szdStoreCookie.getLanguage();
    if (!dg.value.language) dg.value.language = "zh-CN";
  };
  //设备类型
  const getDevice = () => {
    dg.value.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|webOS|Windows Phone|SymbianOS|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  //登录配置
  const getConfig = () => {
    getLoginConfig().then(res => {
      if (res.data.langs) langs.value = res.data.langs;
      if (res.data.langTxt) config.value.langTxt = res.data.langTxt;
      if (res.data.authMsg) authMsg.value = res.data.authMsg;
      if (res.data.config) {
        config.value = res.data.config;
      }
      config.value.version = "河北尚智得信息技术有限公司版权所有";
      //下载svg图标库
      downloadSvg(res.data.svgMd5);
      dg.value.configFlag = true;
    });
  };
  //设置Cookie登录语言
  const handleChangeLanguage = () => {
    szdStoreCookie.setLanguage(dg.value.language);
  };
  //语言翻译
  const tranLanguage = t => {
    if (config.value.langTxt && config.value.langTxt[dg.value.language] && config.value.langTxt[dg.value.language][t]) {
      return config.value.langTxt[dg.value.language][t];
    } else {
      return t;
    }
  };
  //下载svg图标库
  const downloadSvg = svgMd5 => {
    if (szdStoreLocal.getSvgMd5(svgMd5) || !szdStoreLocal.getSvg()) {
      getSvg().then(res => {
        szdStoreLocal.setSvg(res);
        szdStoreLocal.setSvgMd5(svgMd5);
      });
    }
  };
  //登录结果
  const loginResult = res => {
    if (res.type === "PWD_INIT") {
      ElMessage.error(tranLanguage("请先修改密码再登录"));
      refLoginPwd.value.callLoginPwd(dg.value.userId);
    } else if (!res.token) {
      ElMessage.error(tranLanguage("登录失败"));
    } else {
      if (res.type === "PWD_EXPIRE_W") {
        ElMessage.warning(tranLanguage("密码还剩&天到期，请及时修改密码").replace("&", res.days));
      }
      szdStoreSession.removeCoreLogin();
      szdStoreCookie.setToken(res.token); //给token赋值
      dg.value.token = res.token;
      //已登录用户清单
      if (res.loggedList && res.loggedList.length > 0) {
        refLoginUserLogged.value.callLoginUserLogged(res.loggedList);
      } else {
        loginReload();
      }
    }
  };
  //加载应用
  const loginReload = () => {
    location.reload(); //重新加载当前页面
  };
</script>

<style lang="scss" scoped>
  .g-logBg {
    //新版登录须打开一下一条样式v-bind(loginBg);
    background-image: v-bind(loginBg);
    background-repeat: no-repeat;
    background-size: 100% 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    overflow: auto;
    min-width: 500px;
  }

  .login-top {
    padding: 40px 100px 20px 30px;
    max-width: 1920px;
    margin: 0 auto;
    width: 100%;
    height: 110px;
    min-width: 500px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .u-pos {
    position: absolute;
    width: 1920px;
    text-align: right;
    left: 50%;
    transform: translate(-50%, 0);
    padding-right: 100px;
  }

  .login-main {
    display: flex;
    max-width: 1920px;
    margin: 0 auto;
    width: 100%;
    min-width: 500px;
    overflow: auto;
    height: 600px;
    justify-content: flex-end;
    padding: 5px 100px 100px 30px;
    background: v-bind(loginMainBg) no-repeat 100px top;
    background-size: 600px 400px;
    //新版登录须注释一下一条样式
    //background-size: cover;
    &.flexCenter {
      padding: 0 30px;
      justify-content: center;
    }

    .login-wrapper {
      position: relative;

      width: 450px;
      height: 410px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      padding: 20px 25px 50px 25px;
      background: #ffffff;
      border-radius: 5px;

      .login-content {
        flex-grow: 1;
      }

      .other-login {
        position: absolute;
        left: 0;
        bottom: 0;
        right: 0;
        height: 50px;
        align-items: center;
        border-top: 1px solid #eee;
        display: flex;
        padding: 0 30px;
        cursor: pointer;

        .icon-wrapper {
          margin-left: 20px;
          font-size: 30px;

          &.phone {
            font-size: 28px;
          }

          &.pc {
            font-size: 28px;
          }
        }

        .label {
          font-size: 14px;
          color: #666;
        }

        .svg-icon {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }

  .login-main-title {
    text-align: center;
    color: #707070;
  }

  .el-login-footer {
    position: relative;
    height: 100px;
    line-height: 100px;
    width: 100%;

    .footer-text {
      display: flex;
      text-align: center;
      justify-content: center;
      width: 100%;
      height: 50px;
      line-height: 50px;
      font-size: 14px;
      bottom: 20px;
      color: #666666;
      letter-spacing: 0.5px;
    }
  }

  .u-logo {
    position: fixed;
    left: 60px;
    top: 40px;
  }
</style>
