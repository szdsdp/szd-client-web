<template>
  <el-button
    v-if="!_fst.hide"
    :type="type"
    :text="text"
    :link="link"
    :disabled="_fst.disabled"
    :icon="icon"
    :color="color"
    @click="emit('click')"
    :class="label ? '' : 'l-button'">
    {{ $t(label) }}
  </el-button>
</template>

<script setup>
  import { computed } from "vue";
  import { $t } from "../../common/utils/globalConfig";
  import szdComp from "../../common/utils/component";

  const props = defineProps({
    //按钮类型 同Element
    type: {
      type: String,
      default: "primary"
    },
    label: {
      type: String,
      default: ""
    },
    text: {
      type: Boolean
    },
    link: {
      type: Boolean
    },
    disabled: {
      type: Boolean,
      default: false
    },
    noAuth: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String
    },
    color: {
      type: String
    },
    szdfst: {
      type: String
    },
    szdopt: {
      type: String
    }
  });
  //事件
  const emit = defineEmits(["click"]);
  //编辑状态
  const _fst = computed(() => {
    let fst = szdComp.getCompFst(props.szdfst, props.szdopt, props.disabled);
    if (props.noAuth) {
      fst.readonly = false;
      fst.disabled = false;
    }
    return fst;
  });
</script>
<style lang="scss" scoped>
  .l-button {
    > :deep(span) {
      margin-left: 0;
    }
  }
</style>
