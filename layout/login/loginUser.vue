<template>
  <el-form ref="refUserLoginForm" :model="loginForm" :rules="loginRules" class="login-main-form">
    <el-form-item prop="userId">
      <el-input v-model="loginForm.userId" autocomplete="off" :placeholder="tranLanguage('请输入用户名')" @change="handleChangeUserId()">
        <template #prefix>
          <szd-svg name="user" class="el-input__icon input-icon" fixed />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="loginForm.password" type="password" autocomplete="off" :placeholder="tranLanguage('请输入密码')">
        <template #prefix>
          <szd-svg name="password" class="el-input__icon input-icon" fixed />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="code" v-if="config.captcha">
      <el-input v-model="loginForm.code" autocomplete="off" :placeholder="tranLanguage('验证码')" style="width: 63%">
        <template #prefix>
          <szd-svg name="validCode" class="el-input__icon input-icon" fixed />
        </template>
      </el-input>
      <div class="login-code">
        <img :src="dg.codeUrl" @click="getCode" />
      </div>
    </el-form-item>
    <el-checkbox v-model="loginForm.rememberMe" style="margin: 0 0 25px 0">{{ tranLanguage("记住密码") }}</el-checkbox>
    <el-form-item style="width: 100%">
      <el-button :loading="dg.loading" size="default" type="primary" style="width: 100%; height: 36px" @click="handleLogin">
        <span v-if="!dg.loading">{{ tranLanguage("登 录") }}</span>
        <span v-else>{{ tranLanguage("登 录 中") }}...</span>
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
  import { computed, onBeforeMount, onMounted, onUnmounted, ref } from "vue";
  import Cookies from "js-cookie";
  import { encrypt, decrypt } from "./jsencrypt.js";
  import { getCodeImg, login } from "../../client/common/api/login";

  const emit = defineEmits(["loginResult"]);

  const refUserLoginForm = ref();

  const props = defineProps({
    config: {
      type: Object
    },
    mDg: {
      type: Object
    },
    bindThird: {
      type: Object
    }
  });
  //窗口参数
  const dg = ref({
    loading: false, //加载中
    codeUrl: "" //验证码地址
  });
  //表单对象
  const loginForm = ref({
    userId: "",
    password: "",
    rememberMe: false,
    code: "",
    uuid: "",
    appOpenUuid: ""
  });
  //检查规则
  const loginRules = computed(() => {
    return {
      userId: [{ required: true, trigger: "blur", message: tranLanguage("用户名不能为空") }],
      password: [{ required: true, trigger: "blur", message: tranLanguage("密码不能为空") }],
      code: [{ required: true, trigger: "change", message: tranLanguage("验证码不能为空") }]
    };
  });

  onMounted(() => {
    window.addEventListener("keydown", keyDown); //绑定监听事件
  });
  onUnmounted(() => {
    window.removeEventListener("keydown", keyDown); //销毁事件
  });
  //初始参数
  onBeforeMount(() => {
    if (props.config.captcha) {
      getCode();
    }
    getCookie();
  });
  //键盘事件
  const keyDown = e => {
    if (e.key === "Enter") handleLogin();
  };
  //验证码地址
  const getCode = () => {
    getCodeImg().then(res => {
      dg.value.codeUrl = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    });
  };
  //获取Cookie信息
  const getCookie = () => {
    const userId = Cookies.get("userId");
    const password = Cookies.get("password");
    const rememberMe = Cookies.get("rememberMe");
    if (userId) loginForm.value.userId = userId;
    if (password) loginForm.value.password = decrypt(password);
    if (rememberMe) loginForm.value.rememberMe = true;
    loginForm.value.code = "";
    loginForm.value.uuid = "";
    props.mDg.userId = loginForm.value.userId;
  };
  //登录系统
  const handleLogin = () => {
    refUserLoginForm.value.validate(valid => {
      if (valid) {
        setCookie();
        dg.value.loading = true;
        loginForm.value.appOpenUuid = props.bindThird.appOpenUuid;
        login(loginForm.value)
          .then(res => {
            if (res.code === 200) {
              emit("loginResult", res);
            } else {
              getCode();
            }
          })
          .finally(() => {
            dg.value.loading = false;
          });
      }
    });
  };
  //设置cookie
  const setCookie = () => {
    if (loginForm.value.rememberMe) {
      Cookies.set("userId", loginForm.value.userId, { expires: 30 });
      Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
      Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
    } else {
      Cookies.remove("userId");
      Cookies.remove("password");
      Cookies.remove("rememberMe");
    }
  };
  //更新用户
  const handleChangeUserId = () => {
    props.mDg.userId = loginForm.value.userId;
  };
  //语言翻译
  const tranLanguage = t => {
    if (props.config.langTxt && props.config.langTxt[props.mDg.language] && props.config.langTxt[props.mDg.language][t]) {
      return props.config.langTxt[props.mDg.language][t];
    } else {
      return t;
    }
  };
</script>

<style lang="scss" scoped>
  .login-main-form {
    border-radius: 5px;
    background: #ffffff;
    width: 400px;
    min-width: 340px;

    .el-input {
      height: 36px;
      line-height: 36px;
    }

    .input-icon {
      height: 39px;
      width: 14px;
      margin-left: 2px;
    }
  }

  .login-code {
    width: 33%;
    height: 38px;
    float: right;
    text-align: right;

    .img {
      cursor: pointer;
      vertical-align: middle;
    }
  }
</style>
