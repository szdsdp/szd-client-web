<template>
  <section v-if="aiDataObj" class="szd-ai-chat__data">
    <!-- 标题 -->
    <div class="data__header">
      <span>{{ $t("AI采集数据【空和数值0不采集】") }}</span>
      <el-radio-group v-model="dg.rad" size="small">
        <el-radio-button :label="$t('表格')" value="rad1" />
        <el-radio-button label="Json" value="rad2" />
      </el-radio-group>
    </div>
    <!-- 显示数据 -->
    <div class="data__show">
      <!-- 业务数据 -->
      <div v-show="dg.rad === 'rad1'" class="show-table">
        <template v-if="isConfirm && aiDataObj.dataSt?.$obj" v-for="domItem in domList">
          <!--  有字段 -->
          <template v-if="domItem.fieldCode">
            <!-- 结构数据 -->
            <aiChatMainContentDataCollectA
              v-if="domItem.objType === 'A' && aiDataObj.dataSt.$obj[domItem.fieldCode]"
              :domItem="domItem"
              :aiDataObj="aiDataObj.dataSt.$obj[domItem.fieldCode]"
              :szdopt="szdopt" />
            <!-- 表格数据  -->
            <aiChatMainContentDataCollectB
              v-else-if="domItem.objType === 'B' && aiDataObj.dataSt.$obj[domItem.fieldCode]"
              :domItem="domItem"
              :aiDataList="aiDataObj.dataSt.$obj[domItem.fieldCode]"
              :szdopt="szdopt" />
          </template>
          <!--  无字段 -->
          <template v-else>
            <!-- 结构数据-无字段 -->
            <aiChatMainContentDataCollectA
              v-if="domItem.objType === 'A' && aiDataObj.dataSt?.$obj"
              :domItem="domItem"
              :aiDataObj="aiDataObj.dataSt.$obj"
              :szdopt="szdopt" />
            <!-- 表格数据-无字段 -->
            <aiChatMainContentDataCollectB
              v-else-if="domItem.objType === 'B' && aiDataObj.dataSt?.$obj"
              :domItem="domItem"
              :aiDataList="aiDataObj.dataSt.$obj"
              :szdopt="szdopt" />
          </template>
        </template>
        <div v-else class="show-no-rule">
          <div class="no-rule__header">
            <el-icon :size="18"><WarningFilled /></el-icon>
            <span>{{ $t("未生成页面原因") }}</span>
          </div>
          <ul class="no-rule__list">
            <li>{{ $t("采集数据页面字段未维护") }}</li>
            <li>{{ $t("生成数据不符合字段规范") }}</li>
            <li>{{ $t("未收集到需要采集的数据") }}</li>
          </ul>
        </div>
      </div>
      <!-- 原AI数据 -->
      <div v-show="dg.rad === 'rad2'" class="show-hlt">
        <szd-hlt :code="aiDataObj.dataJs" />
      </div>
    </div>
    <!-- 业务处理 -->
    <div v-if="!viewChat && aiLay.collectMode !== '0' && bsDataObj" class="data__btn">
      <el-button type="primary" size="small" :disabled="!isConfirm || szdopt === 'V'" @click="handleConfirm(false)">
        {{ aiDataObj.dataSt?.$opt ? $t("再次") : "" }}{{ $t("采集数据") }}
      </el-button>
      <el-button type="primary" size="small" :disabled="!isConfirm || szdopt === 'V'" @click="handleConfirm(true)">
        {{ aiDataObj.dataSt?.$opt ? $t("再次") : "" }}{{ $t("采集关闭") }}
      </el-button>
    </div>
  </section>
</template>

<script setup>
  import { computed, ref } from "vue";
  import { $t } from "../../../common/utils/globalConfig";
  import { convertCollectData, convertCollectDOM, isCollectConfirm } from "../js/aiChatResultCollect";
  import aiChatMainContentDataCollectA from "./aiChatMainContentDataCollectA.vue";
  import aiChatMainContentDataCollectB from "./aiChatMainContentDataCollectB.vue";

  const emit = defineEmits(["handleConfirm"]);

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
    bsDataObj: {
      type: [Object, Array]
    },
    aiLay: {
      type: Object
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

  //页面字段
  const collectDom = computed(() => {
    try {
      if (props.viewChat && props.messageObj.pageDomJson) {
        return convertCollectDOM(JSON.parse(props.messageObj.pageDomJson), true);
      } else {
        return props.aiDomObj.collectDom;
      }
    } catch (error) {
      return props.aiDomObj.collectDom;
    }
  });

  //dom清单
  const domList = computed(() => {
    let _domList = [];
    let _domItemF = { objType: "A", objDesc: "", domList: [] };
    for (let i = 0; i < collectDom.value.length; i++) {
      let domItem = collectDom.value[i];
      if (domItem.objType === "A" || domItem.objType === "B") {
        _domList.push(domItem);
      } else {
        _domItemF.domList.push(domItem);
      }
    }
    if (_domItemF.domList.length > 0) _domList.unshift(_domItemF);
    return _domList;
  });

  //AI处理数据
  const aiDataObj = computed(() => {
    if (props.messageObj.messageId && !props.contentDataSt[props.messageObj.messageId]) {
      if (props.messageObj.dataJsonSt && props.messageObj.dataJsonSt.$obj) {
        props.contentDataSt[props.messageObj.messageId] = props.messageObj.dataJsonSt;
      } else {
        props.contentDataSt[props.messageObj.messageId] = {
          $obj: convertCollectData(props.messageObj.dataJson, collectDom.value, true),
          $opt: false
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
    return isCollectConfirm(aiDataObj.value.dataSt?.$obj, domList.value);
  });

  //采集确认
  const handleConfirm = closeAi => {
    aiDataObj.value.dataSt.$opt = true;
    emit("handleConfirm", {
      msgObj: props.messageObj,
      btnMode: "collect_confirm",
      btnCode: "collect_confirm",
      closeAi: closeAi,
      dataJs: aiDataObj.value.dataJs,
      dataSt: aiDataObj.value.dataSt
    });
  };
</script>
