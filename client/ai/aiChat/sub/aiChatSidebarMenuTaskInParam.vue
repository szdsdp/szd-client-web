<template>
  <el-form v-if="skillInputParamList && skillInputParamList.length > 0" class="app-el-form ova">
    <el-row>
      <template v-for="(inputParam, index) in skillInputParamList">
        <aiChatSkillInSch :skillInputParam="_taskObj.skillInputParam" :inputParam="inputParam" varDefVal :szdopt="_taskObj.deleFlag ? 'V' : 'U'" />
      </template>
    </el-row>
  </el-form>
  <div v-else class="l-from-task-input-param">
    <el-input
      type="textarea"
      v-model="_taskObj.skillInputParamStr"
      :maxlength="10000"
      show-word-limit
      clearable
      :disabled="_taskObj.deleFlag"
      class="edit-textarea"
      @change="handleChangeText" />
  </div>
</template>

<script setup>
  import { computed, ref } from "vue";
  import { $mE, $mS } from "../../../common/utils/globalConfig";
  import szdTool from "../../../common/tools/tool";
  import vkbeautify from "vkbeautify";
  import aiChatSkillInSch from "./aiChatSkillInSch.vue";

  const emit = defineEmits(["changeSkill", "update:taskObj"]);

  const props = defineProps({
    taskObj: {
      type: Object,
      default: () => {}
    },
    mDg: {
      type: Object,
      default: () => ({})
    },
    skillInputParamList: {
      type: Array,
      default: () => []
    }
  });

  const dg = ref({
    actTab: "edit"
  });

  const _taskObj = computed({
    get: () => props.taskObj,
    set: val => {
      emit("update:taskObj", val);
    }
  });

  //文本改变
  const handleChangeText = () => {
    try {
      _taskObj.value.skillInputParam = JSON.parse(_taskObj.value.skillInputParamStr);
    } catch {
      _taskObj.value.skillInputParam = _taskObj.value.skillInputParamStr;
    }
  };

  //格式化
  const inputParamFormat = () => {
    if (!_taskObj.value.skillInputParamStr) return;
    try {
      _taskObj.value.skillInputParamStr = vkbeautify.json(_taskObj.value.skillInputParamStr);
    } catch (err) {
      $mE("格式化失败，请检查内容格式");
    }
  };

  //检查Json
  const inputParamCheck = () => {
    if (!_taskObj.value.skillInputParamStr) return;
    if (szdTool.isJson(_taskObj.value.skillInputParamStr)) {
      $mS("JSON格式正确");
    } else {
      $mE("JSON格式错误【键名无引号】或【格式不完整】");
    }
  };

  defineExpose({ inputParamFormat, inputParamCheck });
</script>

<style lang="scss" scoped>
  .l-from-task-input-param {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;

    .edit-textarea {
      flex: 1;
      overflow: hidden;

      :deep(.el-textarea__inner) {
        height: 100%;
        border-radius: 1px;
        resize: none;
        font-size: 13px;
      }
    }
  }
</style>
