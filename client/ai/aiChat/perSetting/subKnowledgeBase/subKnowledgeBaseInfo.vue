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
        <szd-input-form-item-col label="知识库ID" v-model="objData.header.kbId" disabled :span="12" />
        <szd-input-form-item-col label="知识库名称" v-model="objData.header.kbName" required :span="12" :szdopt="dg.option" />
        <szd-checkbox-form-item-col label="启用" v-model="objData.header.status" :span="12" :szdopt="dg.option" />
        <szd-textarea-form-item-col label="备注" v-model="objData.header.remark" :span="24" :maxlength="200" labelWidth="12.5%" :szdopt="dg.option" />
      </el-row>
    </el-form>

    <el-tabs v-if="dg.option !== 'C'" v-model="dg.actTab">
      <el-tab-pane :label="$t('知识库文档')" name="TAB1">
        <knowledgeBaseInfoDoc :objData="objData" :mDg="dg" @refreshData="getData" />
      </el-tab-pane>
      <el-tab-pane :label="$t('分配会话组')" name="TAB2">
        <compInfoGrp :objData="objData" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <szd-button v-if="dg.option !== 'V'" label="保存" type="primary" @click="submitForm" />
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
  import { addApi, getApi, updateApi } from "../../api/knowledgeBase";
  import knowledgeBaseInfoDoc from "./knowledgeBaseInfoDoc.vue";
  import compInfoGrp from "../subSessionGrp/compInfoGrp.vue";

  const emit = defineEmits(["updResult"]);
  //窗口参数
  const dg = ref({
    title: "",
    open: false,
    option: "V",
    retCode: "",
    actTab: "TAB1",
    kbId: "",
    orgType: "2",
    userId: ""
  });
  //数据对象
  const objData = ref({
    header: {
      kbId: "",
      kbName: "",
      agentKdId: "",
      orgType: "",
      userId: "",
      status: true,
      remark: ""
    },
    docList: [],
    groupList: [],
    groupUpdate: false
  });

  const callKnowledgeBaseInfo = infoParam => {
    initData();
    dg.value.option = infoParam.option;
    dg.value.kbId = infoParam.kbId;
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
    getApi(dg.value.kbId).then(res => {
      if (res.code === 200) {
        objData.value = res.data;
      }
      dg.value.open = true;
    });
  };
  const getDesc = () => {
    dg.value.title = szdTool.getTitle(dg.value.option) + $t("知识库");
  };
  //保存数据
  const submitForm = () => {
    if (submitFormCheck()) {
      objData.value.groupUpdate = false;
      if (dg.value.option === "C") {
        addApi(objData.value).then(res => {
          if (res.code === 200) {
            $mS("新增成功");
            dg.value.kbId = res.data.header.kbId;
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
    $mListNull(msgList, objData.value.header.kbName, "知识库名称不能为空");
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
        kbId: "",
        kbName: "",
        agentKdId: "",
        orgType: "2",
        userId: "",
        userName: "",
        status: true,
        remark: ""
      },
      docList: [],
      groupList: [],
      groupUpdate: false
    };
    dg.value.actTab = "TAB1";
  };
  //调用方法
  defineExpose({ callKnowledgeBaseInfo });
</script>
