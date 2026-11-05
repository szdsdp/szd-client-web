<template>
  <szd-button
    v-if="label"
    :type="btnType"
    :label="label"
    :text="btnText"
    :link="btnLink"
    :disabled="btnDisabled"
    :icon="btnIcon"
    :color="btnColor"
    :szdfst="btnSzdfst"
    :szdopt="btnSzdopt"
    @click="handleClick" />
  <div v-else v-text="_label" class="l-code" @click="handleClick" />
  <hltDialog ref="refHltDialog" :edit="edit" :required="required" :maxlength="maxlength" :dataType="dataType" @okay="handleOkay" />
</template>

<script setup>
  import { computed, ref } from "vue";
  import { $t } from "../../common/utils/globalConfig";
  import hltDialog from "./hltDialog.vue";
  //子屏幕
  const refHltDialog = ref();

  const emit = defineEmits(["update:code", "change"]);

  const props = defineProps({
    code: {
      default: ""
    },
    label: {
      type: String,
      default: ""
    },
    length: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: ""
    },
    edit: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: Number
    },
    dataType: {
      type: String,
      default: ""
    },
    btnType: {
      type: String
    },
    btnText: {
      type: Boolean
    },
    btnLink: {
      type: Boolean
    },
    btnDisabled: {
      type: Boolean
    },
    btnIcon: {
      type: String
    },
    btnColor: {
      type: String
    },
    btnSzdfst: {
      type: String
    },
    btnSzdopt: {
      type: String
    }
  });

  //值数据
  const _label = computed(() => {
    if (props.label) return props.label;
    let _codeStr = props.code ? (typeof props.code === "string" ? props.code : JSON.stringify(props.code)) : "";
    if (props.edit && !_codeStr) return $t("编辑");
    if (props.length > 0 && _codeStr) {
      return _codeStr.length > props.length ? _codeStr.substring(0, props.length) : _codeStr;
    } else {
      return _codeStr;
    }
  });

  //显示代码
  const handleClick = () => {
    refHltDialog.value.showContent({ code: props.code, title: props.title });
  };

  //更新代码
  const handleOkay = code => {
    emit("update:code", code);
    emit("change", code);
  };
</script>
<style lang="scss" scoped>
  .l-code {
    color: #409eff;
    cursor: pointer;

    &:hover {
      color: #a0cfff;
    }
  }
</style>
