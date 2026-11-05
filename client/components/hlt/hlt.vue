<template>
  <div class="hljs-wrapper">
    <pre><code :class="_styleClass" v-html="_highlightedCode"></code></pre>
  </div>
</template>

<script setup>
  import { computed } from "vue";
  import szdTool from "../../common/tools/tool";
  import vkbeautify from "vkbeautify";
  import "highlight.js/styles/github.css";
  import hljs from "highlight.js";

  const props = defineProps({
    //显示代码
    code: {
      default: ""
    }
  });

  const sqlKey1 = /\b(?:SELECT|UPDATE|DELETE|INSERT|CREATE|ALTER|DROP|TRUNCATE|RENAME)\b/i;
  const sqlKey2 = /\bFROM\b/i;

  //将code统一转为字符串
  const _codeStr = computed(() => {
    if (props.code == null || props.code === "" || props.code === undefined) return "";
    return typeof props.code === "object" ? JSON.stringify(props.code, null, 2) : String(props.code);
  });

  //样式类
  const _styleClass = computed(() => {
    const codeStr = _codeStr.value;
    if (!codeStr) return "plaintext";
    if (szdTool.isJson(codeStr)) return "json";
    if (codeStr.trimStart().startsWith("<\?xml")) return "xml";
    if (sqlKey1.test(codeStr) && sqlKey2.test(codeStr)) return "sql";
    return "javascript";
  });

  //代码
  const _code = computed(() => {
    const codeStr = _codeStr.value;
    if (!codeStr) return "";
    try {
      const lang = _styleClass.value;
      if (lang === "json") return vkbeautify.json(codeStr);
      if (lang === "xml") return vkbeautify.xml(codeStr);
      if (lang === "sql") return vkbeautify.sql(codeStr);
      return codeStr;
    } catch (err) {
      console.error("[hlt] 代码格式化失败:", err.message);
      return codeStr;
    }
  });

  //高亮后的HTML
  const _highlightedCode = computed(() => {
    const codeStr = _code.value;
    if (!codeStr) return "";
    try {
      let highlightedCode = hljs.highlight(codeStr, { language: _styleClass.value });
      return highlightedCode.value;
    } catch (err) {
      console.error("[hlt] 代码高亮失败:", err.message);
      return codeStr;
    }
  });
</script>

<style lang="scss">
  .hljs-wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 1px solid #d8dce6;
    padding: 3px;

    > pre {
      width: 100%;
      height: 100%;
      overflow: auto;
      margin: 0;
      word-break: keep-all;

      > code {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
