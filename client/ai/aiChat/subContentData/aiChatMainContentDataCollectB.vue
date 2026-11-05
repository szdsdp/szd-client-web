<template>
  <!-- 标题 -->
  <div v-if="_fCats.length > 0 && domItem.objDesc" class="show-title">{{ domItem.objDesc }}</div>
  <!-- 结构数据 -->
  <el-table v-if="_fCats.length > 0" border stripe :data="aiDataList">
    <el-table-column v-for="fCat in _fCats" :prop="fCat.fieldCode">
      <template #header>
        <szd-table-col-header :label="fCat.fieldName || fCat.fieldCode" :required="fCat.fieldFst === '2'" />
      </template>
      <template #default="scope">
        <!-- 结构数据 -->
        <aiChatMainContentDataCollectA v-if="fCat.objType === 'A'" :domItem="fCat" :aiDataObj="scope.row[fCat.fieldCode]" :szdopt="szdopt" />
        <!-- 表格数据 -->
        <aiChatMainContentDataCollectB v-else-if="fCat.objType === 'B'" :domItem="fCat" :aiDataList="scope.row[fCat.fieldCode]" :szdopt="szdopt" />
        <!--  控件类型 date -->
        <szd-date
          v-else-if="['date', 'datetime', 'year', 'month'].includes(fCat.fieldType)"
          v-model="scope.row[fCat.fieldCode]"
          :type="fCat.fieldType"
          clearable
          :szdopt="szdopt" />
        <!--  控件类型 time -->
        <szd-time v-else-if="fCat.fieldType === 'time'" v-model="scope.row[fCat.fieldCode]" clearable :szdopt="szdopt" />
        <!--  控件类型 checkbox -->
        <szd-checkbox v-else-if="fCat.fieldType === 'boolean'" v-model="scope.row[fCat.fieldCode]" :szdopt="szdopt" />
        <!--  控件类型 select -->
        <szd-select
          v-else-if="fCat.fieldHelpType === 'B' && fCat.fieldHelpCode"
          v-model="scope.row[fCat.fieldCode]"
          clearable
          :baseField="fCat.fieldHelpCode"
          :szdopt="szdopt" />
        <!--  控件类型 input -->
        <szd-input
          v-else
          v-model="scope.row[fCat.fieldCode]"
          :type="['number'].includes(fCat.fieldType) ? fCat.fieldType : 'string'"
          clearable
          :showHelp="fCat.fieldHelpType === 'A'"
          :help="{ a: fCat.fieldHelpCode, b: scope.row, c: fCat.fieldHelpMap ? [fCat.fieldCode + '-' + (fCat.fieldHelpMap || '*')] : '' }"
          :maxlength="fCat.fieldLen"
          :numDec="fCat.fieldDec"
          :szdopt="szdopt" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
  import { computed } from "vue";
  import aiChatMainContentDataCollectA from "./aiChatMainContentDataCollectA.vue";
  import aiChatMainContentDataCollectB from "./aiChatMainContentDataCollectB.vue";

  const props = defineProps({
    aiDataList: {
      type: Array,
      default: () => []
    },
    domItem: {
      type: Object,
      default: () => {}
    },
    szdopt: {
      type: String
    }
  });

  const _fCats = computed(() => {
    return props.domItem.domList || [];
  });
</script>
