<template>
  <template v-if="!_ctrl.hide">
    <template v-if="_ctrl.descSpan > 0 && _ctrl.descSpan < 24">
      <el-col :span="24 - _ctrl.descSpan">
        <szd-area
          v-model="_modelValue"
          :placeholder="_ctrl.placeholder"
          :disabled="_ctrl.disabled"
          :clearable="_ctrl.clearable"
          :szdfst="_ctrl.szdfst"
          :szdopt="_ctrl.szdopt"
          @change="handleChange" />
      </el-col>
    </template>
    <template v-else>
      <szd-area
        v-model="_modelValue"
        :placeholder="_ctrl.placeholder"
        :disabled="_ctrl.disabled"
        :clearable="_ctrl.clearable"
        :szdfst="_ctrl.szdfst"
        :szdopt="_ctrl.szdopt"
        @change="handleChange" />
    </template>
  </template>
</template>

<script setup>
  import { computed } from "vue";

  const props = defineProps({
    //输入框所需的参数
    modelValue: {
      type: [String, Number]
    },
    //控件参数
    ctrl: {
      type: Object
    }
  });
  const emit = defineEmits(["update:modelValue", "change"]);
  const _modelValue = computed({
    get: () => props.modelValue,
    set: val => {
      emit("update:modelValue", val);
    }
  });
  //控件参数
  const _ctrl = computed(() => {
    let ctrl = {
      placeholder: props.ctrl.placeholder, //占位符
      disabled: props.ctrl.disabled, //不可用
      hide: props.ctrl.hide || ["4", "5"].includes(props.ctrl.szdfst), //隐藏
      clearable: props.ctrl.clearable, //清空按钮
      szdfst: props.ctrl.szdfst, //字段状态
      szdopt: props.ctrl.szdopt //显示状态
    };
    return ctrl;
  });
  //更改事件
  const handleChange = v => {
    emit("change", v);
  };
</script>
