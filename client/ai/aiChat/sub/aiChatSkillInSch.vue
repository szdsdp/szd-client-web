<template>
  <szd-sch-form-item-col
    v-if="inputParam.fieldRange"
    v-model="skillInputParam.ranges[inputParam.fieldCode]"
    :label="inputParam.fieldName || inputParam.fieldCode"
    :type="inputParam.fieldType"
    :numDec="inputParam.fieldDec"
    :help="inputParam.fieldHelpCode ? { a: inputParam.fieldHelpCode, c: inputParam.fieldHelpMap } : undefined"
    :noTo="inputParam.noTo"
    :noExt="inputParam.noExt"
    :disabled="inputParam.disabled || szdopt === 'V' || viewChat"
    :readonly="inputParam.readonly"
    :clearable="inputParam.clearable"
    :clearSpace="inputParam.clearSpace"
    :selectOpt="inputParam.selectOpt"
    :whereOpt="inputParam.whereOpt"
    :required="inputParam.required"
    :varDefVal="varDefVal"
    :span="24" />
  <szd-input-form-item-col
    v-else-if="['string', 'number'].includes(inputParam.fieldType)"
    v-model="skillInputParam[inputParam.fieldCode]"
    :label="inputParam.fieldName || inputParam.fieldCode"
    :type="inputParam.fieldType"
    :numDec="inputParam.fieldDec"
    :readonly="inputParam.readonly"
    :disabled="inputParam.disabled || szdopt === 'V' || viewChat"
    :clearable="inputParam.clearable"
    :required="inputParam.required"
    :help="
      inputParam.fieldHelpCode
        ? {
            a: inputParam.fieldHelpCode,
            b: skillInputParam,
            c: inputParam.fieldHelpMap ? [inputParam.fieldCode + '-' + inputParam.fieldHelpMap] : ''
          }
        : undefined
    "
    :span="24" />
  <szd-checkbox-form-item-col
    v-else-if="inputParam.fieldType === 'boolean'"
    v-model="skillInputParam[inputParam.fieldCode]"
    :label="inputParam.fieldName || inputParam.fieldCode"
    :disabled="inputParam.disabled || szdopt === 'V' || viewChat"
    :span="24" />
  <szd-time-form-item-col
    v-else-if="inputParam.fieldType === 'time'"
    v-model="skillInputParam[inputParam.fieldCode]"
    :label="inputParam.fieldName || inputParam.fieldCode"
    :readonly="inputParam.readonly"
    :disabled="inputParam.disabled || szdopt === 'V' || viewChat"
    :clearable="inputParam.clearable"
    :required="inputParam.required"
    :span="24" />
  <szd-date-form-item-col
    v-else-if="['date', 'datetime', 'month', 'year'].includes(inputParam.fieldType)"
    v-model="skillInputParam[inputParam.fieldCode]"
    :type="inputParam.fieldType"
    :label="inputParam.fieldName || inputParam.fieldCode"
    :readonly="inputParam.readonly"
    :disabled="inputParam.disabled || szdopt === 'V' || viewChat"
    :clearable="inputParam.clearable"
    :required="inputParam.required"
    :span="24" />
  <el-col v-else :span="24">
    <el-form-item :label="inputParam.fieldName || inputParam.fieldCode">
      <szd-hlt-div :code="skillInputParam[inputParam.fieldCode]" :edit="!(inputParam.disabled || szdopt === 'V' || viewChat)" :length="50" />
    </el-form-item>
  </el-col>
</template>

<script setup>
  const props = defineProps({
    skillInputParam: {
      type: Object,
      default: () => ({})
    },
    inputParam: {
      type: Object,
      default: () => ({})
    },
    varDefVal: {
      type: Boolean,
      default: false
    },
    szdopt: {
      type: String
    },
    viewChat: {
      type: Boolean,
      default: false
    }
  });
</script>
