<template>
  <el-dialog
    :title="dg.title"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="['600', '350']" />
    <el-form class="app-el-form" @submit.prevent>
      <szd-input-form-item-col label="会话名称" v-model="_sessionObj.title" required :disabled="_sessionObj.deleFlag" :maxlength="50" :span="24" />
      <szd-textarea-form-item-col
        label="会话主题规范"
        v-model="_sessionObj.sessionHarness"
        :disabled="_sessionObj.deleFlag"
        :maxlength="1000"
        :rows="5"
        :span="24" />
      <szd-input-number-form-item-col
        label="上下文引用轮次"
        v-model="_sessionObj.contextTurns"
        :disabled="_sessionObj.deleFlag"
        :min="0"
        :max="100"
        :precision="0"
        :span="24" />
      <szd-checkbox-form-item-col v-if="dg.option !== 'C'" label="删除标记" v-model="_sessionObj.deleFlag" disabled :span="24" />
    </el-form>

    <template #footer>
      <szd-button v-if="!_sessionObj.deleFlag" label="确定" type="primary" @click="saveForm" />
      <szd-button v-else label="撤回" type="primary" @click="redoForm" />
      <szd-button label="关闭" type="primary" @click="closeForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { $mNull, $mS, $t } from "../../../common/utils/globalConfig";
  import { addSessionChat, deleteSessionChat, updateSessionChat } from "../api/sessionRecord";
  import { szdPopDel } from "../../../common/message/popup";

  const emit = defineEmits(["handleEvent"]);

  const props = defineProps({
    mDg: {
      type: Object,
      default: () => {}
    },
    aiLay: {
      type: Object,
      default: () => ({})
    }
  });

  const dg = ref({
    open: false,
    title: "",
    option: ""
  });

  const _sessionObj = ref({});

  //打开窗口
  const callAiChatMenuChat = (option, sessionObj) => {
    dg.value.open = ["C", "U"].includes(option);
    dg.value.option = option;
    dg.value.title = option === "C" ? $t("创建会话") : $t("编辑会话");
    if (option === "C") {
      _sessionObj.value = { sessionId: "", title: "", sessionHarness: "", contextTurns: 0 };
    } else if (option === "U") {
      _sessionObj.value = {
        sessionId: sessionObj.sessionId,
        title: sessionObj.title,
        sessionHarness: sessionObj.sessionHarness,
        contextTurns: sessionObj.contextTurns,
        deleFlag: sessionObj.deleFlag
      };
    } else if (option === "D") {
      szdPopDel().then(() => {
        sessionObj.deleFlag = true;
        deleteSessionChat(sessionObj).then(res => {
          if (res.code === 200) {
            emit("handleEvent", { fCode: "sessionDelete", sessionObj: sessionObj });
            $mS("删除成功");
          }
        });
      });
    }
  };

  //保存数据
  const saveForm = () => {
    if ($mNull(_sessionObj.value.title, "会话名称不能为空")) return;
    if (dg.value.option === "C") {
      _sessionObj.value.groupCode = props.mDg.groupCode;
      _sessionObj.value.userId = props.mDg.userId;
      _sessionObj.value.routerCode = props.aiLay.routerCode || "";
      _sessionObj.value.deleFlag = false;
      addSessionChat(_sessionObj.value).then(res => {
        if (res.code === 200) {
          _sessionObj.value.sessionId = res.data.sessionId;
          emit("handleEvent", { fCode: "sessionAdd", sessionObj: _sessionObj.value });
          $mS("保存成功");
          dg.value.open = false;
        }
      });
    } else {
      updateSessionChat(_sessionObj.value).then(res => {
        if (res.code === 200) {
          emit("handleEvent", { fCode: "sessionUpdate", sessionObj: _sessionObj.value });
          $mS("保存成功");
          dg.value.open = false;
        }
      });
    }
  };

  //撤回删除
  const redoForm = () => {
    _sessionObj.value.deleFlag = false;
    deleteSessionChat(_sessionObj.value).then(res => {
      if (res.code === 200) {
        emit("handleEvent", { fCode: "sessionRedo", sessionObj: _sessionObj.value });
        $mS("撤回成功");
        dg.value.open = false;
      }
    });
  };

  //关闭窗口
  const closeForm = () => {
    dg.value.open = false;
  };

  defineExpose({ callAiChatMenuChat });
</script>
