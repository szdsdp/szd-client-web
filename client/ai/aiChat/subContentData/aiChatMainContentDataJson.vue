<template>
  <section v-if="aiDataObj" class="szd-ai-chat__data">
    <!-- 标题 -->
    <div class="data__header">
      <span>{{ $t("AI处理结果") }}</span>
    </div>
    <!-- 显示数据 -->
    <div class="data__show">
      <div class="show-hlt">
        <szd-hlt :code="aiDataObj.dataJs" />
      </div>
    </div>
  </section>
</template>

<script setup>
  import { computed } from "vue";
  import { $t } from "../../../common/utils/globalConfig";

  const emit = defineEmits(["handleConfirm"]);

  const props = defineProps({
    messageObj: {
      type: Object,
      default: () => ({})
    }
  });

  //AI处理数据
  const aiDataObj = computed(() => {
    return {
      dataJs: props.messageObj.dataJson
    };
  });
</script>
