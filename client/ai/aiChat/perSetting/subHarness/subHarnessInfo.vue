<template>
  <el-dialog
    :title="dg.title"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    @close="handleCloseForm"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="['85%', '70%']" />
    <el-form class="app-el-form">
      <el-row>
        <szd-input-form-item-col label="规范ID" v-model="objData.header.harnessId" disabled :span="12" />
        <szd-input-form-item-col label="规范名称" v-model="objData.header.harnessName" required :span="12" :szdopt="dg.option" />
        <szd-checkbox-form-item-col label="启用" v-model="objData.header.status" :span="12" :szdopt="dg.option" />
      </el-row>
    </el-form>

    <el-tabs v-model="dg.actTab">
      <el-tab-pane :label="$t('规范内容')" name="TAB1">
        <szd-textarea v-model="objData.header.content" :span="24" :rows="20" :maxlength="2000" :szdopt="dg.option" />
      </el-tab-pane>
      <el-tab-pane :label="$t('分配会话组')" name="TAB2">
        <compInfoGrp :objData="objData" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <szd-button label="保存" type="primary" @click="submitForm" />
      <szd-button label="关闭" type="primary" @click="closeForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import store from "~store";
  import szdTool from "../../../../common/tools/tool";
  import { $mListNull, $mS, $t } from "../../../../common/utils/globalConfig";
  import { szdMsgBox } from "../../../../components/msgBox/msgBox";
  import { addApi, getApi, updateApi } from "../../api/harness";
  import compInfoGrp from "../subSessionGrp/compInfoGrp.vue";

  const emit = defineEmits(["updResult"]);
  //窗口参数
  const dg = ref({
    title: "",
    open: false,
    option: "V",
    retCode: "",
    actTab: "TAB1",
    harnessId: "",
    orgType: "2",
    userId: ""
  });
  //数据对象
  const objData = ref({
    header: {
      harnessId: "",
      harnessName: "",
      orgType: "",
      userId: "",
      status: true,
      content: ""
    },
    groupList: [],
    groupUpdate: false
  });

  const callHarnessInfo = infoParam => {
    initData();
    dg.value.option = infoParam.option;
    dg.value.harnessId = infoParam.harnessId;
    dg.value.userId = infoParam.userId;
    dg.value.retCode = "";
    if (dg.value.option !== "C") {
      getData();
    } else {
      objData.value.header.orgType = "2";
      objData.value.header.userId = dg.value.userId;
      objData.value.header.userName = store.state.loginUser.user.userName;
      dg.value.open = true;
    }
    getDesc();
  };
  //查询数据
  const getData = () => {
    getApi(dg.value.harnessId).then(res => {
      if (res.code === 200) {
        objData.value = res.data;
      }
      dg.value.open = true;
    });
  };
  const getDesc = () => {
    dg.value.title = szdTool.getTitle(dg.value.option) + $t("规范");
  };
  //保存数据
  const submitForm = () => {
    if (submitFormCheck()) {
      objData.value.groupUpdate = false;
      if (dg.value.option === "C") {
        addApi(objData.value).then(res => {
          if (res.code === 200) {
            $mS("新增成功");
            dg.value.harnessId = res.data.header.harnessId;
            dg.value.option = "U";
            dg.value.retCode = "S";
            getData();
          }
        });
      } else {
        updateApi(objData.value).then(res => {
          if (res.code === 200) {
            $mS("保存成功");
            dg.value.retCode = "S";
            getData();
          }
        });
      }
    }
  };
  //检查数据
  const submitFormCheck = () => {
    let msgList = [];
    $mListNull(msgList, objData.value.header.harnessName, "规范名称不能为空");
    $mListNull(msgList, objData.value.header.content, "规范内容不能为空");
    if (msgList.length > 0) {
      szdMsgBox(msgList);
      return false;
    } else {
      return true;
    }
  };

  const closeForm = () => {
    dg.value.open = false;
  };
  const handleCloseForm = () => {
    if (dg.value.retCode === "S") emit("updResult", objData.value.header);
  };
  const initData = () => {
    objData.value = {
      header: {
        harnessId: "",
        harnessName: "",
        orgType: "2",
        userId: "",
        status: true,
        content: ""
      },
      groupList: [],
      groupUpdate: false
    };
    dg.value.actTab = "TAB1";
  };
  //调用方法
  defineExpose({ callHarnessInfo });
</script>
