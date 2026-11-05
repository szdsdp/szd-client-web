<template>
  <el-dialog
    :title="$t(dg.title)"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container szd__tb__wrapper"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="[900, 600]" />

    <div v-if="dg.option === 'U'" class="l-from-textarea">
      <el-tabs v-model="dg.actTab">
        <el-tab-pane :label="$t('预览')" name="view">
          <szd-hlt :code="_code" />
        </el-tab-pane>
        <el-tab-pane :label="$t('编辑')" name="edit">
          <el-input
            type="textarea"
            v-model="_codeStr"
            :maxlength="maxlength"
            show-word-limit
            clearable
            class="edit-textarea"
            @change="handleChangeText" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <szd-hlt v-else :code="_code" />

    <template #footer>
      <template v-if="dg.option === 'U'">
        <span v-if="_lang" class="l-lang">{{ _lang }}</span>
        <szd-button v-if="_lang" label="格式化" type="primary" plain @click="handleCodeFormat" />
        <szd-button v-if="['json', 'xml'].includes(_lang)" label="校验" type="primary" plain @click="handleCodeCheck" />
        <szd-button label="确定" type="primary" @click="okayForm" />
      </template>
      <szd-button label="关闭" type="primary" @click="closeForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { $mE, $mS, $t } from "../../common/utils/globalConfig";
  import szdTool from "../../common/tools/tool";
  import vkbeautify from "vkbeautify";

  const emit = defineEmits(["okay"]);

  const props = defineProps({
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
    }
  });

  const sqlKey1 = /\b(?:SELECT|UPDATE|DELETE|INSERT|CREATE|ALTER|DROP|TRUNCATE|RENAME)\b/i;
  const sqlKey2 = /\bFROM\b/i;

  //功能参数
  const dg = ref({
    open: false,
    title: "显示内容",
    option: "V",
    actTab: "view"
  });
  //显示代码
  const _code = ref();
  const _codeStr = ref("");
  const _lang = ref("plaintext");

  //显示内容
  const showContent = obj => {
    dg.value.open = true;
    if (obj.title) dg.value.title = obj.title;
    dg.value.option = props.edit === true ? "U" : "V";
    dg.value.actTab = "view";
    _code.value = obj.code;
    _codeStr.value = "";
    _lang.value = "";
    if (dg.value.option === "U") {
      _codeStr.value = getCodeStr();
      _lang.value = getLang();
    }
  };

  //编辑内容
  const getCodeStr = () => {
    if (_code.value == null || _code.value === "" || _code.value === undefined) {
      return "";
    } else if (typeof _code.value === "object") {
      return JSON.stringify(_code.value, null, 2);
    } else {
      return String(_code.value);
    }
  };

  //语言
  const getLang = () => {
    const dt = props.dataType ? props.dataType.toLowerCase() : "";
    if (["plaintext", "json", "xml", "sql", "javascript", "string"].includes(dt)) return dt;
    if (!_codeStr.value) return "plaintext";
    if (szdTool.isJson(_codeStr.value)) return "json";
    if (_codeStr.value.trimStart().startsWith("<\?xml")) return "xml";
    if (sqlKey1.test(_codeStr.value) && sqlKey2.test(_codeStr.value)) return "sql";
    return "plaintext";
  };

  //文本改变
  const handleChangeText = () => {
    if (_lang.value === "json") {
      try {
        _code.value = JSON.parse(_codeStr.value);
      } catch {
        _code.value = _codeStr.value;
      }
    } else {
      _code.value = _codeStr.value;
    }
  };

  //格式化
  const handleCodeFormat = () => {
    if (!_codeStr.value) return;
    _lang.value = getLang();
    try {
      if (_lang.value === "json") _codeStr.value = vkbeautify.json(_codeStr.value);
      if (_lang.value === "xml") _codeStr.value = vkbeautify.xml(_codeStr.value);
      if (_lang.value === "sql") _codeStr.value = vkbeautify.sql(_codeStr.value);
    } catch (err) {
      $mE("格式化失败，请检查内容格式");
    }
  };

  //确定
  const okayForm = () => {
    if (checkForm()) {
      emit("okay", _code.value);
      dg.value.open = false;
    }
  };

  //检查
  const checkForm = () => {
    if (props.required && !_code.value) {
      $mE("内容不能为空");
      return false;
    }
    if (!_code.value) return true;
    //检查内容
    return handleCodeCheck();
  };

  //校验
  const handleCodeCheck = () => {
    if (!_codeStr.value) return true;
    _lang.value = getLang();
    if (_lang.value === "json") {
      if (szdTool.isJson(_codeStr.value)) {
        $mS("JSON格式正确");
      } else {
        $mE("JSON格式错误【键名无引号】或【格式不完整】");
        return false;
      }
    }
    if (_lang.value === "xml") {
      try {
        const parser = new DOMParser();
        const parseError = parser.parseFromString(_codeStr.value, "text/xml").querySelector("parsererror");
        if (parseError) {
          $mE("XML格式错误");
          return false;
        } else {
          $mS("XML格式正确");
        }
      } catch {
        $mE("XML格式错误");
        return false;
      }
    }
    return true;
  };

  //关闭
  const closeForm = () => {
    dg.value.open = false;
  };

  //定义父组件可用方法
  defineExpose({
    showContent
  });
</script>
<style lang="scss" scoped>
  .l-from-textarea {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1;
    overflow: hidden;

    .edit-textarea {
      flex: 1;
      overflow: hidden;

      :deep(.el-textarea__inner) {
        height: 100%;
        border-radius: 1px;
        font-size: 13px;
      }
    }
  }

  .l-lang {
    font-size: 12px;
    color: #909399;
    background: #f4f4f5;
    padding: 2px 8px;
    border-radius: 3px;
    margin-right: 8px;
  }
</style>
