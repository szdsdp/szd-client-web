<template>
  <el-form class="app-el-form">
    <el-row>
      <szd-textarea-form-item-col
        label="会话主题规范"
        v-model="_taskObj.sessionHarness"
        :disabled="_taskObj.deleFlag"
        :maxlength="1000"
        :span="24"
        labelWidth="12.5%" />
    </el-row>
    <el-row>
      <szd-select-form-item-col label="任务分类" v-model="_taskObj.taskType" disabled baseField="SKIS_AI_TASK_TYPE" :span="12" />
      <szd-input-form-item-col label="路由代码" v-model="_taskObj.routerCode" disabled :span="12" :descSpan="12" :desc="_taskObj.routerName" />
      <szd-input-form-item-col
        label="功能按钮"
        v-model="_taskObj.btnCode"
        showHelp
        :help="{
          a: 'SKIS_AI_BTN_GRP',
          b: _taskObj,
          c: ['btnCode', 'btnName'],
          d: [
            ['groupCode', _taskObj.groupCode],
            ['btnMode', _taskObj.taskType === 'A' ? 'approve' : 'analy_send']
          ]
        }"
        required
        :span="12"
        :descSpan="12"
        :desc="_taskObj.btnName" />
      <szd-checkbox-form-item-col v-if="_taskObj.taskType === 'B'" label="工单自动提交" v-model="_taskObj.btnCodeCommit" :span="12" />
    </el-row>
    <!-- 自动审批 -->
    <el-row v-if="_taskObj.taskType === 'A'">
      <szd-input-form-item-col label="业务类型" v-model="_taskObj.bstp" disabled :span="12" :descSpan="12" :desc="_taskObj.bstpName" />
      <szd-input-form-item-col label="节点代码" v-model="_taskObj.nodeId" disabled :span="12" :descSpan="12" :desc="_taskObj.nodeName" />
    </el-row>
    <!-- 数据分析 -->
    <el-row v-if="_taskObj.taskType === 'B'">
      <szd-input-form-item-col
        label="Skill代码"
        v-model="_taskObj.skillCode"
        showHelp
        :help="{ a: 'SKIS_AI_SKILL_GRP', b: _taskObj, c: ['skillCode', 'skillName'], d: [['groupCode', _taskObj.groupCode]] }"
        format="upper"
        readonly
        :disabled="_taskObj.deleFlag"
        required
        :span="12"
        :descSpan="12"
        :desc="_taskObj.skillName"
        @change="handleChangeSkill" />
      <szd-input-form-item-col
        label="工单业务类型"
        v-model="_taskObj.btnCodeBstp"
        showHelp
        :help="{ a: 'CORE_BSTP', b: _taskObj, c: ['btnCodeBstp-bstp', 'btnCodeBstpName-bstpName'], d: [['routerCode', 'SKIS_AI_20A']] }"
        required
        :span="12"
        :descSpan="12"
        :desc="_taskObj.btnCodeBstpName" />
    </el-row>
    <!-- 自动任务提示词 -->
    <el-row>
      <szd-textarea-form-item-col
        label="自动任务提示词"
        v-model="_taskObj.promptContent"
        required
        :disabled="_taskObj.deleFlag"
        :maxlength="2000"
        :span="24"
        labelWidth="12.5%" />
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-form-item :label="$t('自动任务时间')" required>
          <el-col :span="5">
            <szd-select v-model="_taskObj.taskHourSeg[0]" :baseArr="_baseArrHour" clearable :showKey="false" :disabled="_taskObj.deleFlag" />
          </el-col>
          <el-col :span="5" class="pl5">
            <szd-select v-model="_taskObj.taskHourSeg[1]" :baseArr="_baseArrHour" clearable :showKey="false" :disabled="_taskObj.deleFlag" />
          </el-col>
          <el-col :span="5" class="pl5">
            <szd-select v-model="_taskObj.taskHourSeg[2]" :baseArr="_baseArrHour" clearable :showKey="false" :disabled="_taskObj.deleFlag" />
          </el-col>
          <el-col :span="5" class="pl5">
            <szd-select v-model="_taskObj.taskHourSeg[3]" :baseArr="_baseArrHour" clearable :showKey="false" :disabled="_taskObj.deleFlag" />
          </el-col>
          <el-col :span="4" class="pl5">
            {{ $t("时") }}
          </el-col>
        </el-form-item>
      </el-col>
      <szd-checkbox-form-item-col label="启用任务" v-model="_taskObj.taskStatus" :disabled="_taskObj.deleFlag" :span="12" />
      <szd-date-form-item-col v-if="mDg.option !== 'C'" label="最后执行时间" v-model="_taskObj.taskEctTime" disabled :span="12" />
      <szd-checkbox-form-item-col v-if="mDg.option !== 'C'" label="删除标记" v-model="_taskObj.deleFlag" disabled :span="12" />
    </el-row>
  </el-form>
</template>

<script setup>
  import { computed } from "vue";
  import { $t } from "../../../common/utils/globalConfig";
  import { checkSessionTaskSkill } from "../api/sessionAutoTaskAuth";

  const emit = defineEmits(["changeSkill", "update:taskObj"]);

  const props = defineProps({
    taskObj: {
      type: Object,
      default: () => {}
    },
    mDg: {
      type: Object,
      default: () => ({})
    }
  });

  const _taskObj = computed({
    get: () => props.taskObj,
    set: val => {
      emit("update:taskObj", val);
    }
  });

  const _baseArrHour = computed(() => {
    let arr = [];
    for (let i = 0; i < 24; i++) {
      arr.push({ svalue: i.toString(), sname: i.toString() });
    }
    return arr;
  });

  const handleChangeSkill = () => {
    checkSessionTaskSkill(_taskObj.value.taskAuthId, _taskObj.value.skillCode);
    emit("changeSkill");
  };
</script>
