<template>
  <el-dialog :title="$t('默认值设置')" v-model="isVisible" draggable align-center append-to-body destroy-on-close class="app-dialog-container">
    <div v-szd-dialog="[600, 300]" />
    <el-form class="app-el-form">
      <!-- 低值 -->
      <el-row>
        <szd-select-form-item-col label="低值-规则" v-model="_rangeDefVal.lowRule" :baseArr="baseArr" clearable :span="24" />
        <el-col :span="24">
          <el-form-item :label="$t('低值-加减')">
            <el-col v-if="['date'].includes(type)" :span="3" class="l-range-col-def">
              <span>{{ $t("天数") }}</span>
            </el-col>
            <el-col v-if="['date'].includes(type)" :span="5">
              <szd-input-number v-model="_rangeDefVal.lowIntDay" :precision="0" :min="-1000000" :max="1000000" />
            </el-col>
            <el-col v-if="['date', 'month'].includes(type)" :span="3" class="l-range-col-def">
              <span>{{ $t("月数") }}</span>
            </el-col>
            <el-col v-if="['date', 'month'].includes(type)" :span="5">
              <szd-input-number v-model="_rangeDefVal.lowIntMonth" :precision="0" :min="-100000" :max="100000" />
            </el-col>
            <el-col :span="3" class="l-range-col-def">
              <span>{{ $t("年数") }}</span>
            </el-col>
            <el-col :span="5">
              <szd-input-number v-model="_rangeDefVal.lowIntYear" :precision="0" :min="-10000" :max="10000" />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 高值 -->
      <el-row>
        <szd-select-form-item-col label="高值-规则" v-model="_rangeDefVal.highRule" :baseArr="baseArr" clearable :span="24" />
        <el-col :span="24">
          <el-form-item :label="$t('高值-加减')">
            <el-col v-if="['date'].includes(type)" :span="3" class="l-range-col-def">
              <span>{{ $t("天数") }}</span>
            </el-col>
            <el-col v-if="['date'].includes(type)" :span="5">
              <szd-input-number v-model="_rangeDefVal.highIntDay" :precision="0" :min="-1000000" :max="1000000" />
            </el-col>
            <el-col v-if="['date', 'month'].includes(type)" :span="3" class="l-range-col-def">
              <span>{{ $t("月数") }}</span>
            </el-col>
            <el-col v-if="['date', 'month'].includes(type)" :span="5">
              <szd-input-number v-model="_rangeDefVal.highIntMonth" :precision="0" :min="-100000" :max="100000" />
            </el-col>
            <el-col :span="3" class="l-range-col-def">
              <span>{{ $t("年数") }}</span>
            </el-col>
            <el-col :span="5">
              <szd-input-number v-model="_rangeDefVal.highIntYear" :precision="0" :min="-10000" :max="10000" />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <szd-button label="确认" type="primary" @click="handleOkay" :disabled="readonly || disabled" />
      <szd-button label="取消" type="primary" @click="isVisible = false" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed, ref } from "vue";
  import { $t } from "../../common/utils/globalConfig";

  const emit = defineEmits(["defValueOkay"]);

  const props = defineProps({
    type: {
      type: String
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  });

  const isVisible = ref(false);
  const _rangeDefVal = ref({});
  const _range = ref();

  //打开窗口
  const callSeniorSearchDefValueOpen = range => {
    _rangeDefVal.value = {
      lowRule: range.defVal?.lowRule || "",
      lowIntDay: range.defVal?.lowIntDay || 0,
      lowIntMonth: range.defVal?.lowIntMonth || 0,
      lowIntYear: range.defVal?.lowIntYear || 0,
      highRule: range.defVal?.highRule || "",
      highIntDay: range.defVal?.highIntDay || 0,
      highIntMonth: range.defVal?.highIntMonth || 0,
      highIntYear: range.defVal?.highIntYear || 0
    };
    _range.value = range;
    isVisible.value = true;
  };

  const handleOkay = () => {
    isVisible.value = false;
    if (!_rangeDefVal.value.lowRule) {
      _rangeDefVal.value.lowRule = "";
      _rangeDefVal.value.lowIntDay = 0;
      _rangeDefVal.value.lowIntMonth = 0;
      _rangeDefVal.value.lowIntYear = 0;
    }
    if (!_rangeDefVal.value.highRule) {
      _rangeDefVal.value.highRule = "";
      _rangeDefVal.value.highIntDay = 0;
      _rangeDefVal.value.highIntMonth = 0;
      _rangeDefVal.value.highIntYear = 0;
    }
    _range.value.defVal = _rangeDefVal.value;
    emit("defValueOkay");
  };

  //下拉框-规则值
  const baseArr = computed(() => {
    if (props.type === "date") {
      return [
        { svalue: "10", sname: "当前日期" },
        { svalue: "11", sname: "本月第一天" },
        { svalue: "12", sname: "本月最后一天" },
        { svalue: "13", sname: "本年第一天" },
        { svalue: "14", sname: "本年最后一天" },
        { svalue: "15", sname: "本季第一天" },
        { svalue: "16", sname: "本季最后一天" }
      ];
    } else if (props.type === "month") {
      return [
        { svalue: "20", sname: "当前月" },
        { svalue: "21", sname: "本年第一月" },
        { svalue: "22", sname: "本年最后一月" },
        { svalue: "23", sname: "本季第一月" },
        { svalue: "24", sname: "本季最后一月" }
      ];
    } else if (props.type === "year") {
      return [{ svalue: "30", sname: "当前年" }];
    }
  });

  defineExpose({ callSeniorSearchDefValueOpen });
</script>

<style scoped lang="scss">
  .l-range-col-def {
    text-align: end;
    padding: 0 5px;
  }
</style>
