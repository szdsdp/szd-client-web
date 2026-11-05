<template>
  <el-dialog
    :title="$t('Skill参数')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="[700, 500]" />

    <el-form class="app-el-form" @submit.prevent>
      <template v-for="(inputParam, index) in rowObj.inputParamList">
        <aiChatSkillInSch :skillInputParam="rowObj.skillParamsJs" :inputParam="inputParam" :szdopt="szdopt" :viewChat="viewChat" />
      </template>
    </el-form>

    <template #footer>
      <szd-button label="关闭" type="primary" @click="closeForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { $t } from "../../../common/utils/globalConfig";
  import aiChatSkillInSch from "../sub/aiChatSkillInSch.vue";

  const props = defineProps({
    szdopt: {
      type: String
    },
    viewChat: {
      type: Boolean
    }
  });

  const dg = ref({
    open: false
  });

  //行数据
  const rowObj = ref({});

  const callContentDataSkillDgIn = row => {
    rowObj.value = row;
    dg.value.open = true;
  };

  const closeForm = () => {
    dg.value.open = false;
  };

  defineExpose({ callContentDataSkillDgIn });
</script>
