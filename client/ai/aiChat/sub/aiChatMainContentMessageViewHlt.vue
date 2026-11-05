<template>
  <el-col :span="24">
    <el-form-item :label="$t(label)" labelWidth="12.5%">
      <szd-hlt-div v-if="code" :code="code" :length="100" />
      <div v-else>{{ $t("无") }}</div>
    </el-form-item>
  </el-col>
</template>

<script setup>
  import { $t } from "../../../common/utils/globalConfig";

  const props = defineProps({
    label: {
      type: String,
      default: ""
    },
    code: {}
  });
</script>
