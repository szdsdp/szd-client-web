<template>
  <template v-if="dg.showAi">
    <!-- AI按钮 -->
    <el-button
      :size="_butLay.size"
      :type="_butLay.type"
      :plain="_butLay.plain"
      :text="_butLay.text"
      :round="_butLay.round"
      :circle="_butLay.circle"
      @click="openAiChat">
      {{ _butLay.label }}
    </el-button>
    <!-- AI会话内容 -->
    <el-dialog
      :title="_dgLay.title"
      v-model="dg.open"
      append-to-body
      :close-on-click-modal="false"
      class="app-dialog-container"
      destroy-on-close
      align-center
      draggable>
      <div v-szd-dialog="_dgLay.size" />
      <!-- AI会话内容 -->
      <aiChatDiv :data="data" :total="total" :aiLay="aiLay" :aiFst="aiFst" :szdopt="szdopt" :callMethod="callMethod" @aiEvent="handleAiEvent" />
    </el-dialog>
  </template>
</template>

<script setup>
  import { computed, onBeforeMount, ref, watch } from "vue";
  import store from "~store";
  import szdStoreSession from "../../common/store/storeSession";
  import { $t } from "../../common/utils/globalConfig";
  import aiChatDiv from "./aiChatDiv.vue";
  import { getAiConfigHeader } from "./api/aiChat";

  const emit = defineEmits(["aiEvent"]);
  const loginUser = store.state.loginUser.user;

  const props = defineProps({
    dgLay: {
      type: Object,
      default: () => ({})
    },
    btnLay: {
      type: Object,
      default: () => ({})
    },
    //业务数据
    data: {
      type: [Object, Array]
    },
    //total总条数
    total: {
      type: Number,
      default: 0
    },
    //ai参数
    aiLay: {
      type: Object,
      default: () => ({})
    },
    //ai字段
    aiFst: {
      type: [Object, Array, String]
    },
    //编辑操作
    szdopt: {
      type: String,
      default: "U"
    },
    //回调方法
    callMethod: {
      type: Function,
      default: null
    }
  });
  //功能参数
  const dg = ref({
    open: false,
    showAi: false,
    groupCode: "",
    userId: loginUser.userId
  });
  //窗口参数
  const _dgLay = computed(() => {
    return {
      size: props.dgLay?.size || ["95%", "95%"],
      title: props.dgLay?.title || $t("AI助理")
    };
  });
  //按钮参数
  const _butLay = computed(() => {
    return {
      size: props.btnLay?.size && ["large", "default", "small"].includes(props.btnLay.size) ? props.btnLay.size : undefined,
      type: props.btnLay?.type ? props.btnLay.type : "primary",
      label: props.btnLay?.label || "AI助手",
      plain: props.btnLay?.plain,
      text: props.btnLay?.text,
      round: props.btnLay?.round,
      circle: props.btnLay?.circle
    };
  });

  onBeforeMount(() => {
    initAiData();
  });

  const initAiData = () => {
    dg.value.showAi = false;
    if (props.aiLay.groupCode || props.aiLay.routerCode) {
      const aiOn = szdStoreSession.getWebParams("skis_ai_chat", false);
      if (aiOn === "on") {
        getAiConfigHeader({ groupCode: props.aiLay.groupCode, routerCode: props.aiLay.routerCode, userId: dg.value.userId }).then(res => {
          if (res && res.code === 200 && res.data?.groupCode) {
            dg.value.showAi = true;
          }
        });
      }
    }
  };

  //打开AI窗口
  const openAiChat = () => {
    dg.value.open = true;
  };

  //回调事件
  const handleAiEvent = obj => {
    emit("aiEvent", obj);
    if (obj.closeAi) {
      dg.value.open = false;
    }
  };

  //监听参数变化
  watch(
    () => [props.aiLay?.groupCode, props.aiLay?.routerCode],
    () => {
      initAiData();
    }
  );
</script>
