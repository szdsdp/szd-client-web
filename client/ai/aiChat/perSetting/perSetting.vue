<template>
  <el-dialog
    :title="$t('参数设置')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    @close="handleCloseForm"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="['85%', '80%']" />
    <el-form class="app-el-form">
      <el-row>
        <szd-input-form-item-col label="会话组代码" v-model="objData.header.groupCode" disabled :span="12" />
        <szd-input-form-item-col label="会话组名称" v-model="objData.header.groupName" disabled :span="12" />
        <szd-checkbox-form-item-col label="启用" v-model="objData.header.status" disabled :span="12" />
      </el-row>
    </el-form>

    <el-tabs v-model="dg.actTab">
      <el-tab-pane :label="$t('个人提示词')" name="TAB1">
        <perSettingPerPrompt :objData="objData" :btnArr="btnArr" />
      </el-tab-pane>
      <el-tab-pane v-if="objData.header.actPerKb" :label="$t('个人知识库')" name="TAB2">
        <perSettingPerKb :objData="objData" :btnArr="btnArr" />
      </el-tab-pane>
      <el-tab-pane v-if="objData.header.actPerHarness" :label="$t('个人业务规范')" name="TAB3">
        <perSettingPerHarness :objData="objData" :btnArr="btnArr" />
      </el-tab-pane>
      <el-tab-pane :label="$t('公司提示词')" name="TAB6">
        <perSettingCmpPrompt :objData="objData" :btnArr="btnArr" />
      </el-tab-pane>
      <el-tab-pane v-if="objData.header.showCmyKb" :label="$t('公司知识库')" name="TAB7">
        <perSettingCmpKb :objData="objData" :btnArr="btnArr" />
      </el-tab-pane>
      <el-tab-pane v-if="objData.header.showCmyHarness" :label="$t('公司业务规范')" name="TAB8">
        <perSettingCmpHarness :objData="objData" :btnArr="btnArr" />
      </el-tab-pane>
      <el-tab-pane v-if="objData.header.showCmyBtn" :label="$t('公司功能按钮')" name="TAB9">
        <perSettingCmpBtn :objData="objData" :btnArr="btnArr" />
      </el-tab-pane>
      <el-tab-pane v-if="objData.header.showCmySkill" :label="$t('公司Skill能力')" name="TAB10">
        <perSettingCmpSkill :objData="objData" :btnArr="btnArr" />
      </el-tab-pane>
      <el-tab-pane v-if="objData.header.showCmySkill" :label="$t('公司SQL技能')" name="TAB11">
        <perSettingCmpSkillDb :objData="objData" :btnArr="btnArr" />
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
  import { getApi, saveApi } from "../api/perSetting";
  import { szdMsgBox } from "../../../components/msgBox/msgBox";
  import { $mList, $mListNull, $mS, $t } from "../../../common/utils/globalConfig";
  import perSettingPerPrompt from "./sub/perSettingPerPrompt.vue";
  import perSettingPerKb from "./sub/perSettingPerKb.vue";
  import perSettingPerHarness from "./sub/perSettingPerHarness.vue";
  import perSettingCmpPrompt from "./sub/perSettingCmpPrompt.vue";
  import perSettingCmpKb from "./sub/perSettingCmpKb.vue";
  import perSettingCmpHarness from "./sub/perSettingCmpHarness.vue";
  import perSettingCmpBtn from "./sub/perSettingCmpBtn.vue";
  import perSettingCmpSkill from "./sub/perSettingCmpSkill.vue";
  import perSettingCmpSkillDb from "./sub/perSettingCmpSkillDb.vue";

  const emit = defineEmits(["refresh"]);
  //窗口对象
  const dg = ref({
    open: false,
    actTab: "TAB1",
    retCode: "",
    groupCode: "",
    userId: store.state.loginUser.user.userId
  });
  //数据对象
  const objData = ref({
    header: {},
    cmpBtnList: [],
    cmpSkillList: [],
    cmpSkillDbList: [],
    cmpKbList: [],
    cmpHarnessList: [],
    cmpPromptList: [],
    perKbList: [],
    perHarnessList: [],
    perPromptList: []
  });
  //按钮选择
  const btnArr = ref([]);

  //打开窗口
  const callPerSetting = infoParam => {
    initData();
    dg.value.groupCode = infoParam.groupCode;
    dg.value.retCode = "";
    getData();
  };

  //查询数据
  const getData = () => {
    getApi(dg.value.groupCode, dg.value.userId).then(res => {
      if (res.code === 200 && res.data) {
        objData.value = res.data;
        btnArr.value = [];
        if (objData.value.cmpBtnList?.length > 0) {
          for (let i = 0; i < objData.value.cmpBtnList.length; i++) {
            let item = objData.value.cmpBtnList[i];
            btnArr.value.push({ svalue: item.btnCode, sname: item.btnName });
          }
        }
      }
      dg.value.open = true;
    });
  };

  //保存数据
  const submitForm = () => {
    if (submitFormCheck()) {
      objData.value.header.userId = dg.value.userId;
      saveApi(objData.value).then(res => {
        if (res.code === 200) {
          dg.value.retCode = "S";
          $mS("保存成功");
          getData();
        }
      });
    }
  };

  //检查数据
  const submitFormCheck = () => {
    let msgList = [];
    //知识库
    submitFormCheckKbList(objData.value.perKbList, msgList);
    //业务规范
    submitFormCheckHarnessList(objData.value.perHarnessList, msgList);
    //提示词
    submitFormCheckPromptList(objData.value.perPromptList, msgList);
    if (msgList.length > 0) {
      szdMsgBox(msgList);
      return false;
    } else {
      return true;
    }
  };
  //检查数据-知识库
  const submitFormCheckKbList = (kbList, msgList) => {
    let ck = [];
    let ckBtn = [];
    for (let i = 0; i < kbList.length; i++) {
      const item = kbList[i];
      if (!item.btnCode) item.btnCode = "";
      if (ck.includes(item.kbId + "_" + item.btnCode)) {
        $mList(msgList, ["知识库ID+功能按钮重复", item.kbId + "_" + item.btnCode]);
      }
      ck.push(item.kbId + "_" + item.btnCode);
      //同一知识库功能按钮存在时，不能存在为空的功能按钮
      let ckBtnItem = ckBtn.find(r => r.kbId === item.kbId);
      if (ckBtnItem) {
        if (!item.btnCode) ckBtnItem.btnN = true;
        if (item.btnCode) ckBtnItem.btnY = true;
      } else {
        ckBtn.push({ kbId: item.kbId, btnN: !item.btnCode, btnY: !!item.btnCode });
      }
    }
    for (let i = 0; i < ckBtn.length; i++) {
      if (ckBtn[i].btnN && ckBtn[i].btnY) {
        $mList(msgList, ["同一知识库功能按钮存在时，不能存在为空的功能按钮", ckBtn[i].kbId]);
      }
    }
  };
  //检查数据-业务规范
  const submitFormCheckHarnessList = (harnessList, msgList) => {
    let ck = [];
    let ckBtn = [];
    for (let i = 0; i < harnessList.length; i++) {
      const item = harnessList[i];
      if (!item.btnCode) item.btnCode = "";
      if (ck.includes(item.harnessId + "_" + item.btnCode)) {
        $mList(msgList, ["业务规范ID+功能按钮重复", item.harnessId + "_" + item.btnCode]);
      }
      ck.push(item.harnessId + "_" + item.btnCode);
      //同一业务规范功能按钮存在时，不能存在为空的功能按钮
      let ckBtnItem = ckBtn.find(r => r.harnessId === item.harnessId);
      if (ckBtnItem) {
        if (!item.btnCode) ckBtnItem.btnN = true;
        if (item.btnCode) ckBtnItem.btnY = true;
      } else {
        ckBtn.push({ harnessId: item.harnessId, btnN: !item.btnCode, btnY: !!item.btnCode });
      }
    }
    for (let i = 0; i < ckBtn.length; i++) {
      if (ckBtn[i].btnN && ckBtn[i].btnY) {
        $mList(msgList, ["同一业务规范功能按钮存在时，不能存在为空的功能按钮", ckBtn[i].harnessId]);
      }
    }
  };
  //检查数据-提示词
  const submitFormCheckPromptList = (promptList, msgList) => {
    let ck1 = [];
    let ck2 = [];
    for (let i = 0; i < promptList.length; i++) {
      const item = promptList[i];
      $mListNull(msgList, item.title, "提示词-标题不能为空");
      $mListNull(msgList, item.content, "提示词-内容不能为空");
      if (ck1.includes(item.title)) {
        $mList(msgList, ["提示词-标题重复", item.title]);
      }
      if (ck2.includes(item.content)) {
        $mList(msgList, ["提示词-内容重复", item.content]);
      }
      if (item.skillCode) item.btnCode = "skill_api";

      ck1.push(item.title);
      ck2.push(item.content);
    }
  };
  //关闭窗口
  const closeForm = () => {
    dg.value.open = false;
  };
  //关闭窗口-处理
  const handleCloseForm = () => {
    if (dg.value.retCode === "S") emit("refresh");
  };
  //初始化
  const initData = () => {
    objData.value = {
      header: {
        groupCode: "",
        groupName: "",
        userId: "",
        status: true,
        actPerKb: true,
        actPerHarness: true,
        showCmyKb: true,
        showCmyHarness: true,
        showCmySkill: true,
        showCmyBtn: true
      },
      cmpBtnList: [],
      cmpSkillList: [],
      cmpSkillDbList: [],
      cmpKbList: [],
      cmpHarnessList: [],
      cmpPromptList: [],
      perKbList: [],
      perHarnessList: [],
      perPromptList: []
    };
    btnArr.value = [];
  };

  defineExpose({
    callPerSetting
  });
</script>
