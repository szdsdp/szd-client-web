<template>
  <section v-if="aiDataObj" class="szd-ai-chat__data">
    <!-- 标题 -->
    <div class="data__header">
      <span>{{ $t("AI技能调用") }}</span>
      <el-radio-group v-model="dg.rad" size="small">
        <el-radio-button :label="$t('表格')" value="rad1" />
        <el-radio-button label="Json" value="rad2" />
      </el-radio-group>
    </div>
    <!-- 显示数据 -->
    <div class="data__show">
      <div v-show="dg.rad === 'rad1'" class="show-table">
        <!-- 功能按钮 -->
        <div v-if="isConfirm" class="main-table-title">
          <div class="main-table-title-left" style="width: 100%">
            <span>{{ $t("如需维护提示词和附件，请维护在会话输入框中。") }}</span>
          </div>
        </div>
        <!-- 技能清单 -->
        <el-table v-if="isConfirm" border stripe :data="aiDataObj.dataSt.$obj">
          <el-table-column prop="skillCode" :label="$t('技能代码')" min-width="180">
            <template #default="scope">
              <template v-if="scope.row.skillCode">{{ scope.row.skillCode }}.{{ scope.row.skillName }}</template>
              <template v-else-if="scope.row.skillSql">{{ $t("智能SQL") }}</template>
            </template>
          </el-table-column>
          <el-table-column prop="skillParamsJs" :label="$t('技能参数')" min-width="400">
            <template #default="scope">
              <template v-if="scope.row.inputParamList && scope.row.inputParamList.length > 0">
                <template v-for="(inputParam, index) in scope.row.inputParamList">
                  <aiChatSkillInSch
                    v-if="index < 3"
                    :skillInputParam="scope.row.skillParamsJs"
                    :inputParam="inputParam"
                    :szdopt="szdopt"
                    :viewChat="viewChat" />
                </template>
                <span style="display: block; text-align: right">
                  <szd-button v-if="scope.row.inputParamList.length > 3" label="更多" type="primary" link @click="handleRowMore(scope.row)" />
                </span>
              </template>
              <template v-else>
                <szd-hlt-div v-model:code="scope.row.skillParamsJs" :edit="scope.row.skillCode && !viewChat" :length="100" />
              </template>
            </template>
          </el-table-column>
          <el-table-column v-if="messageObj.btnMode === 'skill_api'" prop="routerCode" :label="$t('路由代码')" min-width="180">
            <template #default="scope">
              <template v-if="scope.row.routerCode">{{ scope.row.routerCode }}.{{ scope.row.routerName }}</template>
            </template>
          </el-table-column>
          <el-table-column prop="skillDesc" :label="$t('技能描述')" min-width="180" />
          <!-- 操作  -->
          <el-table-column :label="$t('操作')" width="180" fixed="right" align="center">
            <template #default="scope">
              <szd-button
                v-if="(scope.row.skillCode || scope.row.skillSql) && !viewChat"
                :label="aiDataObj.dataSt.$opt['ITM_' + scope.row.itemNo] ? '再次执行技能' : '执行技能'"
                type="primary"
                link
                icon="Check"
                @click="handleRowExecSkill(scope.row)" />
              <szd-button v-if="scope.row.routerCode" label="跳转路由" type="primary" link icon="TopRight" @click="handleRowGoNav(scope.row)" />
              <szd-hlt-div label="Skill详情" btnLink btnIcon="View" v-model:code="scope.row" />
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="show-no-rule">
          <div class="no-rule__header">
            <el-icon :size="18"><WarningFilled /></el-icon>
            <span>{{ $t("未查询到可以调用技能") }}</span>
          </div>
          <ul class="no-rule__list">
            <li>{{ $t("提示词内容不准确") }}</li>
            <li>{{ $t("查询条件数据不准确") }}</li>
          </ul>
        </div>
      </div>
      <div v-show="dg.rad === 'rad2'" class="show-hlt">
        <szd-hlt :code="aiDataObj.dataJs" />
      </div>
    </div>

    <aiChatMainContentDataSkillDgIn ref="refAiChatMainContentDataSkillDgIn" :szdopt="szdopt" :viewChat="viewChat" />
  </section>
</template>

<script setup>
  import { computed, ref } from "vue";
  import { $t } from "../../../common/utils/globalConfig";
  import szdRouter from "../../../common/utils/goRouter";
  import { convertSkillData } from "../js/aiChatResultSkill";
  import aiChatSkillInSch from "../sub/aiChatSkillInSch.vue";
  import aiChatMainContentDataSkillDgIn from "./aiChatMainContentDataSkillDgIn.vue";

  const emit = defineEmits(["handleConfirm"]);

  const refAiChatMainContentDataSkillDgIn = ref();

  const props = defineProps({
    messageObj: {
      type: Object,
      default: () => ({})
    },
    contentDataSt: {
      type: Object
    },
    aiDomObj: {
      type: Object,
      default: () => ({})
    },
    szdopt: {
      type: String
    },
    viewChat: {
      type: Boolean
    }
  });

  //功能参数
  const dg = ref({
    rad: "rad1"
  });

  //AI处理数据
  const aiDataObj = computed(() => {
    if (props.messageObj.messageId && !props.contentDataSt[props.messageObj.messageId]) {
      if (props.messageObj.dataJsonSt && props.messageObj.dataJsonSt.$obj?.skillParamsJs) {
        props.contentDataSt[props.messageObj.messageId] = props.messageObj.dataJsonSt;
      } else {
        props.contentDataSt[props.messageObj.messageId] = {
          $obj: convertSkillData(props.messageObj.dataJson),
          $opt: {}
        };
      }
    }
    return {
      dataJs: props.messageObj.dataJson,
      dataSt: props.messageObj.messageId ? props.contentDataSt[props.messageObj.messageId] : ""
    };
  });

  //是否可确认
  const isConfirm = computed(() => {
    if (aiDataObj.value.dataSt?.$obj?.length > 0) return true;
    return false;
  });

  //方法
  const handleRowExecSkill = row => {
    aiDataObj.value.dataSt.$opt["ITM_" + row.itemNo] = true;
    emit("handleConfirm", {
      msgObj: props.messageObj,
      btnMode: "skill_api_confirm",
      btnCode: "skill_api_confirm",
      closeAi: false,
      dataJs: aiDataObj.value.dataJs,
      dataSt: aiDataObj.value.dataSt,
      skillJson: row
    });
  };

  //跳转路由
  const handleRowGoNav = row => {
    szdRouter.goNav(row.routerCode, {}, { blank: true });
  };

  //更多参数
  const handleRowMore = row => {
    refAiChatMainContentDataSkillDgIn.value.callContentDataSkillDgIn(row);
  };
</script>
