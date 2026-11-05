<template>
  <!-- 标题 -->
  <div v-if="_fCats.length > 0 && domItem.objDesc" class="show-title">{{ domItem.objDesc }}</div>
  <!-- 结构数据 -->
  <el-form v-if="_fCats.length > 0" class="app-el-form">
    <el-row>
      <template v-for="fCat in _fCats">
        <!-- 结构数据 -->
        <el-col v-if="fCat.objType === 'A'" :span="24">
          <aiChatMainContentDataCollectA :domItem="fCat" :aiDataObj="aiDataObj[fCat.fieldCode]" :szdopt="szdopt" />
        </el-col>
        <!-- 表格数据 -->
        <el-col v-else-if="fCat.objType === 'B'" :span="24">
          <aiChatMainContentDataCollectB :domItem="fCat" :aiDataList="aiDataObj[fCat.fieldCode]" :szdopt="szdopt" />
        </el-col>
        <!--  控件类型 date -->
        <szd-date-form-item-col
          v-else-if="['date', 'datetime', 'year', 'month'].includes(fCat.fieldType)"
          v-model="aiDataObj[fCat.fieldCode]"
          :type="fCat.fieldType"
          clearable
          :label="fCat.fieldName"
          :span="12"
          :required="fCat.fieldFst === '2'"
          :szdopt="szdopt" />
        <!--  控件类型 time -->
        <szd-time-form-item-col
          v-else-if="fCat.fieldType === 'time'"
          v-model="aiDataObj[fCat.fieldCode]"
          clearable
          :label="fCat.fieldName"
          :span="12"
          :required="fCat.fieldFst === '2'"
          :szdopt="szdopt" />
        <!--  控件类型 checkbox -->
        <szd-checkbox-form-item-col
          v-else-if="fCat.fieldType === 'boolean'"
          v-model="aiDataObj[fCat.fieldCode]"
          :label="fCat.fieldName"
          :span="12"
          :szdopt="szdopt" />
        <!--  控件类型 select -->
        <szd-select-form-item-col
          v-else-if="fCat.fieldHelpType === 'B' && fCat.fieldHelpCode"
          v-model="aiDataObj[fCat.fieldCode]"
          clearable
          :label="fCat.fieldName"
          :baseField="fCat.fieldHelpCode"
          :span="12"
          :required="fCat.fieldFst === '2'"
          :szdopt="szdopt" />
        <!--  控件类型 input -->
        <szd-input-form-item-col
          v-else
          v-model="aiDataObj[fCat.fieldCode]"
          :type="['number'].includes(fCat.fieldType) ? fCat.fieldType : 'string'"
          clearable
          :label="fCat.fieldName"
          :showHelp="fCat.fieldHelpType === 'A'"
          :help="{ a: fCat.fieldHelpCode, b: aiDataObj, c: fCat.fieldHelpMap ? [fCat.fieldCode + '-' + (fCat.fieldHelpMap || '*')] : '' }"
          :maxlength="fCat.fieldLen"
          :numDec="fCat.fieldDec"
          :span="12"
          :required="fCat.fieldFst === '2'"
          :szdopt="szdopt" />
      </template>
    </el-row>
  </el-form>
</template>

<script setup>
  import { computed } from "vue";
  import aiChatMainContentDataCollectA from "./aiChatMainContentDataCollectA.vue";
  import aiChatMainContentDataCollectB from "./aiChatMainContentDataCollectB.vue";

  const props = defineProps({
    aiDataObj: {
      type: Object,
      default: () => {}
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
