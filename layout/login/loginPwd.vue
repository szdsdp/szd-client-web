<template>
  <el-dialog
    :title="tranLanguage('修改密码')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    align-center
    draggable>
    <div v-szd-dialog="[600, 300]" />
    <el-form class="app-el-form">
      <el-form-item :label="tranLanguage('登录账号')" required>
        <el-input v-model="objData.userId" autocomplete="off" :maxlength="32" />
      </el-form-item>
      <el-form-item :label="tranLanguage('旧密码')" required>
        <el-input v-model="objData.oldPassword" type="password" autocomplete="off" :maxlength="32" />
      </el-form-item>
      <el-form-item :label="tranLanguage('新密码')" required>
        <el-input v-model="objData.newPassword" type="password" autocomplete="new-password" :maxlength="32" />
      </el-form-item>
      <el-form-item :label="tranLanguage('确认密码')" required>
        <el-input v-model="objData.confirmPassword" type="password" autocomplete="new-password" :maxlength="32" />
      </el-form-item>
      <el-form-item style="color: #1890ff">
        <label>{{ tranLanguage("温馨提示") }} : {{ tranLanguage(dg.tips) }}</label>
      </el-form-item>
    </el-form>
    <!-- 功能按钮 -->
    <template #footer>
      <el-button type="primary" @click="submitForm">{{ tranLanguage("确认") }}</el-button>
      <el-button type="primary" @click="closeForm">{{ tranLanguage("取消") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { ElMessage } from "element-plus";
  import { changePwd } from "../../client/common/api/login";

  const props = defineProps({
    config: {
      type: Object
    },
    mDg: {
      type: Object
    }
  });
  //窗口参数
  const dg = ref({
    open: false,
    tips: ""
  });
  const objData = ref({
    userId: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  //打开窗口
  const callLoginPwd = userId => {
    initData();
    dg.value.open = true;
    objData.value.userId = userId;
  };
  //保存数据
  const submitForm = () => {
    if (submitFormCheck()) {
      changePwd(objData.value).then(response => {
        if (response.code === 200) {
          ElMessage.success(tranLanguage("密码更改成功"));
          closeForm();
        }
      });
    }
  };
  //检查数据
  const submitFormCheck = () => {
    if (!objData.value.userId) {
      ElMessage.error(tranLanguage("登录账号不能为空"));
      return false;
    }
    if (!objData.value.oldPassword) {
      ElMessage.error(tranLanguage("旧密码不能为空"));
      return false;
    }
    if (!objData.value.newPassword) {
      ElMessage.error(tranLanguage("新密码不能为空"));
      return false;
    }
    if (!objData.value.confirmPassword) {
      ElMessage.error(tranLanguage("确认密码不能为空"));
      return false;
    }
    if (objData.value.oldPassword === objData.value.newPassword) {
      ElMessage.error(tranLanguage("新密码和旧密码不能相同"));
      return false;
    }
    if (objData.value.newPassword !== objData.value.confirmPassword) {
      ElMessage.error(tranLanguage("确认密码和新密码不一致"));
      return false;
    }
    return true;
  };
  //关闭窗口
  const closeForm = () => {
    dg.value.open = false;
    location.reload();
  };
  //初始化数据
  const initData = () => {
    objData.value.oldPassword = "";
    objData.value.newPassword = "";
    objData.value.confirmPassword = "";
    dg.value.tips = props.config.pwdTip;
  };
  //语言翻译
  const tranLanguage = t => {
    if (props.config.langTxt && props.config.langTxt[props.mDg.language] && props.config.langTxt[props.mDg.language][t]) {
      return props.config.langTxt[props.mDg.language][t];
    } else {
      return t;
    }
  };

  defineExpose({ callLoginPwd });
</script>
