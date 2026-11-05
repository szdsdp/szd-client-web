<template>
  <aiChatMainContentDataCollect
    v-if="messageObj.btnMode === 'collect'"
    :messageObj="messageObj"
    :contentDataSt="contentDataSt"
    :aiDomObj="aiDomObj"
    :bsDataObj="bsDataObj"
    :aiLay="aiLay"
    :szdopt="szdopt"
    :viewChat="viewChat"
    @handleConfirm="handleConfirm" />
  <aiChatMainContentDataApprove
    v-else-if="messageObj.btnMode === 'approve'"
    :messageObj="messageObj"
    :contentDataSt="contentDataSt"
    :aiDomObj="aiDomObj"
    :bsDataObj="bsDataObj"
    :aiLay="aiLay"
    :szdopt="szdopt"
    :viewChat="viewChat"
    @handleConfirm="handleConfirm" />
  <aiChatMainContentDataSkill
    v-else-if="['skill_api', 'skill_sql'].includes(messageObj.btnMode)"
    :messageObj="messageObj"
    :contentDataSt="contentDataSt"
    :aiDomObj="aiDomObj"
    :szdopt="szdopt"
    :viewChat="viewChat"
    @handleConfirm="handleConfirm" />
  <aiChatMainContentDataAnalySend
    v-else-if="messageObj.btnMode === 'analy_send'"
    :messageObj="messageObj"
    :contentDataSt="contentDataSt"
    :aiDomObj="aiDomObj"
    :szdopt="szdopt"
    :viewChat="viewChat"
    @handleConfirm="handleConfirm" />
  <aiChatMainContentDataJson v-else :messageObj="messageObj" @handleConfirm="handleConfirm" />
</template>

<script setup>
  import aiChatMainContentDataCollect from "./aiChatMainContentDataCollect.vue";
  import aiChatMainContentDataApprove from "./aiChatMainContentDataApprove.vue";
  import aiChatMainContentDataSkill from "./aiChatMainContentDataSkill.vue";
  import aiChatMainContentDataAnalySend from "./aiChatMainContentDataAnalySend.vue";
  import aiChatMainContentDataJson from "./aiChatMainContentDataJson.vue";

  const emit = defineEmits(["handleEvent"]);

  const props = defineProps({
    messageObj: {
      type: Object,
      default: () => ({})
    },
    contentDataSt: {
      type: Object
    },
    aiDomObj: {
      type: Object,
      default: () => ({})
    },
    bsDataObj: {
      type: [Object, Array]
    },
    aiLay: {
      type: Object
    },
    szdopt: {
      type: String
    },
    viewChat: {
      type: Boolean
    }
  });

  //业务处理确认
  const handleConfirm = obj => {
    emit("handleEvent", obj);
  };
</script>
