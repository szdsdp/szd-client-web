<template>
  <div v-if="MarkdownRenderer" class="l-mark-down">
    <MarkdownRenderer :markdown="_markdown" style="background-color: #ffffff; padding: 5px 5px" />
  </div>
</template>

<script setup>
  import { computed, defineAsyncComponent } from "vue";
  import("shiki").catch(() => {});
  import("shiki-stream").catch(() => {});
  const MarkdownRenderer = defineAsyncComponent(() => import("x-markdown-vue").then(m => m.MarkdownRenderer || m.default));

  const props = defineProps({
    content: {
      type: String,
      default: ""
    }
  });

  const _markdown = computed(() => {
    if (!props.content) return "";
    let markdown = props.content;
    markdown = markdown.replace(/^(#{1,6})(?=[^\s#])/gm, "$1 ");
    markdown = markdown.replace(/^(#{1,6}\s+[^#\n]+?)\s*(\|.+\|)\s*$/gm, "$1\n\n$2");
    //  统一清洗AI返回的JSON转义引号 \" → "
    markdown = markdown.replace(/\\"/g, '"');
    //  删除外层重复标题、表格正则，统一交给formatMarkdown内部处理
    markdown = formatMarkdown(markdown);
    // 清洗多余连续空行
    markdown = markdown.replace(/\n{3,}/g, "\n\n");
    return markdown;
  });

  /**
   * 纯同步markdown格式化，修复所有粘连mermaid、表格、代码块问题
   * @param {string} text 原始文本
   * @returns {string} 规整后markdown
   */
  const formatMarkdown = text => {
    if (!text) return "";
    const lines = text.split("\n");
    const result = [];

    for (const rawLine of lines) {
      let line = rawLine;
      // 1. 标题自动补空格 #xxx → # xxx
      line = line.replace(/^(#{1,6})(?=[^\s#])/, "$1 ");

      let fragments = [line];
      // 临时存储行尾闭合标记 ```
      let closingFence = "";

      // ========== 第一步：提取行末尾的 ``` 闭合标记 ==========
      const closeFenceReg = /\s*(`{3,})$/;
      const closeMatch = line.match(closeFenceReg);
      if (closeMatch) {
        closingFence = closeMatch[1];
        // 去掉末尾闭合标记，剩余主体内容继续处理
        line = line.slice(0, closeMatch.index).trim();
        fragments = [line];
      }

      // 第二步：修复粘连 ```mermaidpie / mermaidflowchart
      const stickyReg =
        /(`{3,})mermaid(pie|flowchart|graph|sequenceDiagram|stateDiagram|stateDiagram-v2|classDiagram|erDiagram|gantt|timeline|gitGraph|xychart-beta|sankey|mindmap|quadrant)(.*)/;
      const stickyMatch = line.match(stickyReg);
      if (stickyMatch) {
        const idx = stickyMatch.index;
        const prefix = line.slice(0, idx).trim();
        const fence = stickyMatch[1];
        const chartType = stickyMatch[2];
        const chartContent = stickyMatch[3].trim();
        const suffix = line.slice(idx + stickyMatch[0].length).trim();

        fragments = [];
        if (prefix) fragments.push(prefix);
        fragments.push(`${fence}mermaid`);
        fragments.push(`${chartType}${chartContent ? " " + chartContent : ""}`);
        if (suffix) fragments.push(suffix);
      }

      // 第三步：遍历片段处理同行文字+表格
      for (let frag of fragments) {
        const tableReg = /^(.+?)\s*(\|.+\|)\s*$/;
        const tableMatch = frag.match(tableReg);
        if (tableMatch) {
          const textPart = tableMatch[1].trim();
          const tablePart = tableMatch[2];
          const isTitle = /^#{1,6}\s/.test(textPart);
          const isTableStart = textPart.startsWith("|");
          const isList = /^(-|\d+\.)\s/.test(textPart);

          if (textPart && !isTitle && !isTableStart && !isList) {
            result.push(textPart);
            result.push("");
            result.push(tablePart);
          } else {
            result.push(frag);
          }
        } else {
          result.push(frag);
        }
      }

      // ========== 第四步：如果提取到行尾闭合 ```，单独追加一行 ==========
      if (closingFence) {
        result.push(closingFence);
      }
    }
    return result.join("\n");
  };

  const _content = `### Token消耗分布
\`\`\`mermaid
pie showData title 个人业务Token用量
"RAG知识库" : 6200
"自动工作流" : 2500
"对话问答" : 1300`;
</script>

<style lang="scss">
  .l-mark-down {
    width: 100%;
    /* markdown 表格样式 */
    .x-md-renderer table {
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
    }

    .x-md-renderer th,
    .x-md-renderer td {
      border: 1px solid #e4e7ed;
      padding: 5px;
    }

    .x-md-renderer th {
      background-color: #f5f7fa;
      font-weight: 600;
      text-align: center;
    }
  }
</style>
