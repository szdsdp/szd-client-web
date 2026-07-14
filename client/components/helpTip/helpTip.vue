<template>
  <div v-if="helpTip">
    <el-icon class="main-help-tip">
      <QuestionFilled @click.prevent.stop="handleHelpTip" />
    </el-icon>
  </div>
</template>

<script setup>
  import szdTool from "../../common/tools/tool";

  const props = defineProps({
    helpTip: {
      type: String
    }
  });

  //显示文字帮助事件
  const handleHelpTip = () => {
    szdTool.helpDoc(props.helpTip);
  };
</script>
