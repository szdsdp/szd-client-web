<template>
  <el-dialog
    :title="tranLanguage('已登录用户')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    @close="handleCloseForm"
    align-center
    draggable>
    <div v-szd-dialog="[800, 500]" />

    <div class="main-table-title">
      <div class="main-table-title-left" style="width: 100%">
        <span>{{ tranLanguage("如需退出已登录，请在清单中选择") }}</span>
      </div>
    </div>
    <!-- 已登录用户清单 -->
    <el-table border stripe :data="loggedList" @selection-change="handleSelRow">
      <el-table-column type="selection" width="40" align="center" />
      <el-table-column :label="tranLanguage('IP地址')" prop="userIp" min-width="150" />
      <el-table-column :label="tranLanguage('登录时间')" prop="userLoginTime" min-width="200" />
      <el-table-column :label="tranLanguage('终端设备')" prop="userDevice" min-width="200" />
    </el-table>

    <template #footer>
      <el-button type="primary" @click="submitForm">{{ tranLanguage("登录") }}</el-button>
      <el-button type="primary" @click="closeForm">{{ tranLanguage("取消") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import store from "~store";
  import { removeLogged } from "../../client/common/api/login";

  const emit = defineEmits(["loginReload"]);

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
    loginFlag: false
  });
  const loggedList = ref([]);
  const listSel = ref([]);
  //打开窗口
  const callLoginUserLogged = infoParam => {
    loggedList.value = infoParam;
    dg.value.loginFlag = false;
    dg.value.open = true;
  };
  //选中行
  const handleSelRow = selection => {
    listSel.value = selection;
  };
  //确认登录
  const submitForm = () => {
    dg.value.loginFlag = true;
    if (listSel.value.length > 0) {
      //移除已登录用户
      removeLogged(listSel.value).finally(() => {
        emit("loginReload");
      });
    } else {
      emit("loginReload");
    }
    dg.value.open = false;
  };
  //关闭窗口
  const handleCloseForm = () => {
    if (!dg.value.loginFlag) {
      store.dispatch("LogOut").then(() => {
        location.reload();
      });
    }
  };
  //关闭窗口
  const closeForm = () => {
    dg.value.open = false;
  };
  //语言翻译
  const tranLanguage = t => {
    if (props.config.langTxt && props.config.langTxt[props.mDg.language] && props.config.langTxt[props.mDg.language][t]) {
      return props.config.langTxt[props.mDg.language][t];
    } else {
      return t;
    }
  };

  defineExpose({ callLoginUserLogged });
</script>
