<template>
  <el-form-item v-if="!_fst.hide" :label="_label" :label-width="labelWidth" :prop="prop" :required="_fst.required">
    <template v-if="helpTip" #label>
      <div class="main-form-label">
        <span>{{ _label }}</span>
        <el-icon class="main-help-tip">
          <QuestionFilled @click.prevent.stop="handleHelpTip" />
        </el-icon>
      </div>
    </template>
    <szd-hlt-div
      v-model:code="_code"
      :label="label"
      :length="length"
      :title="title"
      :edit="edit"
      :required="required"
      :maxlength="maxlength"
      :dataType="dataType"
      :btnType="btnType"
      :btnText="btnText"
      :btnLink="btnLink"
      :btnDisabled="btnDisabled"
      :btnIcon="btnIcon"
      :btnColor="btnColor"
      :btnSzdfst="btnSzdfst || szdfst"
      :btnSzdopt="btnSzdopt || szdopt"
      @change="handleChange" />
  </el-form-item>
</template>

<script setup>
  import { computed } from "vue";
  import { $t } from "../../common/utils/globalConfig";
  import szdTool from "../../common/tools/tool";
  import szdComp from "../../common/utils/component";

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
    },
    szdfst: {
      type: String
    },
    szdopt: {
      type: String
    },
    //form-item所需的参数
    formLabel: {
      type: String,
      default: ""
    },
    prop: {
      type: String
    },
    labelWidth: {
      type: [Number, String]
    },
    helpTip: {
      type: String
    }
  });
  const emit = defineEmits(["update:code", "change"]);
  const _code = computed({
    get: () => props.code,
    set: val => {
      emit("update:code", val);
    }
  });
  //编辑状态
  const _fst = computed(() => {
    return szdComp.getCompFstForm(props.szdfst, props.required);
  });
  const _label = computed(() => {
    return $t(props.formLabel);
  });
  //更改事件
  const handleChange = v => {
    emit("change", v);
  };
  //显示文字帮助事件
  const handleHelpTip = () => {
    szdTool.helpDoc(props.helpTip);
  };
</script>
