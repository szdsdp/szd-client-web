<template>
  <div class="szd__tb__wrapper">
    <szd-sch-area :schLay="schLay" v-model="queryParams.ranges" :autoQuery="false" @handleEvent="handleSchEventImp" />
    <szd-table
      :layout="tabLay.layout"
      :toolbar="tabLay.toolbar"
      :fieldCat="tabLay.fieldCat"
      v-model:data="dataList"
      v-model:page="tabLay.page"
      @handleRequest="handleRequestImp"
      @handleRowEvent="handleRowEventImp"
      border
      stripe />
    <sessionRecordContent ref="refSessionRecordContent" />
  </div>
</template>

<script setup>
  import { onMounted, ref } from "vue";
  import { $mS } from "../../../../common/utils/globalConfig";
  import { szdPopDel } from "../../../../common/message/popup";
  import { perListApi, deleteSessionTask, updateSessionTaskStatus, checkSessionTaskSkill } from "../../api/sessionAutoTaskAuth";
  import sessionRecordContent from "../sessionRecord/sessionRecordContent.vue";

  //子屏幕
  const refSessionRecordContent = ref();

  const props = defineProps({
    mDg: {
      type: Object,
      default: () => {}
    }
  });

  //查询条件
  const queryParams = ref({
    ranges: {}
  });
  //查询条件参数
  const schLay = ref({
    layout: { report: "SKIS_AI_11A_PER", more: "6", showRule: "web_ai_sch_skis_ai_11a_pc" },
    schCat: [
      { field: "taskType", label: "任务分类", type: "string", help: { a: "SKIS_AI_TASK_TYPE" } },
      { field: "groupCode", label: "会话组", type: "string", help: { a: "SKIS_AI_GROUP" } },
      { field: "btnCode", label: "功能按钮", type: "string", help: { a: "SKIS_AI_BTN" } },
      { field: "title", label: "会话标题", type: "string", whereOpt: "SP" },
      { field: "routerCode", label: "路由代码", type: "string", help: { a: "CORE_BSRO" } },
      { field: "skillCode", label: "Skill代码", type: "string", help: { a: "SKIS_AI_SKILL" } },
      { field: "bstp", label: "业务类型", type: "string", help: { a: "CORE_BSTP" } },
      { field: "nodeName", label: "节点名称", type: "string", whereOpt: "SP" },
      { field: "nodeId", label: "节点编码", type: "string" },
      { field: "taskStatus", label: "是否启用", type: "boolean" },
      { field: "deleFlag", label: "是否删除", type: "boolean" },
      { field: "updateTime", label: "维护时间", type: "date" }
    ]
  });
  //表格参数
  const tabLay = ref({
    layout: { report: "SKIS_AI_11A_PER", optionCell: "optionCell" },
    fieldCat: [
      { field: "taskAuthId", label: "任务授权ID", minWidth: 180, align: "center" },
      { field: "groupCode", label: "会话组代码", minWidth: 150 },
      { field: "groupName", label: "会话组名称", minWidth: 200 },
      { field: "title", label: "会话标题", minWidth: 250 },
      { field: "taskTypeName", label: "任务分类", minWidth: 120 },
      { field: "btnCodeName", label: "功能按钮", minWidth: 180 },
      { field: "skillCode", label: "Skill技能代码", minWidth: 150 },
      { field: "skillName", label: "Skill技能名称", minWidth: 180 },
      { field: "routerCode", label: "路由代码", minWidth: 150 },
      { field: "routerName", label: "路由名称", minWidth: 180 },
      { field: "bstp", label: "业务类型", minWidth: 150 },
      { field: "nodeId", label: "节点编码", minWidth: 120 },
      { field: "nodeName", label: "节点名称", minWidth: 200 },
      { field: "promptContent", label: "自动任务提示词", type: "hlt", minWidth: 300 },
      { field: "taskStatus", label: "启用", width: 80, align: "center" },
      { field: "deleFlag", label: "删除", width: 80, align: "center" },
      { field: "skillInputParam", label: "Skill输入参数", type: "hlt", minWidth: 180 },
      { field: "taskHourSeg", label: "任务时段", minWidth: 180, align: "center" },
      { field: "taskEctTime", label: "最后执行时间", minWidth: 180, align: "center" },
      { field: "tokenUsed", label: "Token消耗", width: 120, type: "number", doSum: "1" },
      { field: "tokenTimes", label: "会话轮次", width: 120, type: "number", doSum: "1" },
      { field: "sessionId", label: "会话ID", minWidth: 180, align: "center" },
      { field: "agentSessionId", label: "Agent会话ID", minWidth: 250, align: "center" },
      { field: "createTime", label: "创建时间", type: "datetime", minWidth: 150, align: "center" },
      { field: "updateTime", label: "更新时间", type: "datetime", minWidth: 150, align: "center" },
      {
        field: "operation",
        label: "操作",
        width: 180,
        align: "center",
        fixed: "right",
        type: "button",
        ctrlParam: [
          { fCode: "detail", label: "详情", icon: "View", link: true },
          { fCode: "stClose", label: "停止", icon: "SwitchButton", link: true },
          { fCode: "stOpen", label: "启动", icon: "SwitchButton", link: true },
          { fCode: "deleYes", label: "删除", icon: "Delete", link: true },
          { fCode: "deleNo", label: "撤回", icon: "RefreshLeft", link: true }
        ]
      }
    ],
    page: { pageNum: 1, pageSize: 20, total: 0 }
  });
  //数据
  const dataList = ref([]);

  onMounted(() => {
    getList();
  });
  //查询列表
  const getList = () => {
    queryParams.value.ranges["userId"] = [{ type: "string", option: "EQ", low: props.mDg.userId }];
    const params = {
      pageNum: tabLay.value.page.pageNum,
      pageSize: tabLay.value.page.pageSize,
      ranges: queryParams.value.ranges
    };
    perListApi(params).then(res => {
      if (res.code === 200) {
        dataList.value = res.rows;
        tabLay.value.page.total = res.total;
        //按钮设置
        for (let i = 0; i < dataList.value.length; i++) {
          setOptionCell(dataList.value[i]);
        }
      }
    });
  };
  //设置行操作按钮
  const setOptionCell = row => {
    row.optionCell = { operation: { stClose: {}, stOpen: {}, deleYes: {}, deleNo: {} } };
    if (row.taskStatus) {
      row.optionCell.operation.stOpen = { hide: true };
    } else {
      row.optionCell.operation.stClose = { hide: true };
    }
    if (row.deleFlag) {
      row.optionCell.operation.deleYes = { hide: true };
    } else {
      row.optionCell.operation.deleNo = { hide: true };
    }
  };
  //查询
  const handleSchEventImp = fCode => {
    if (fCode === "$search") {
      tabLay.value.page.pageNum = 1;
      getList();
    }
  };
  //分页/排序请求
  const handleRequestImp = () => {
    getList();
  };
  //行按钮事件
  const handleRowEventImp = obj => {
    if (obj.fCode === "detail") {
      refSessionRecordContent.value.callSessionRecordContent("chat", obj.row);
    } else if (obj.fCode === "stClose" || obj.fCode === "stOpen") {
      obj.row.taskStatus = obj.fCode === "stOpen";
      updateSessionTaskStatus({ taskAuthId: obj.row.taskAuthId, taskStatus: obj.row.taskStatus }).then(res => {
        if (res.code === 200) {
          props.mDg.retCode = "S";
          $mS("更新成功");
          getList();
        }
      });
    } else if (obj.fCode === "deleYes") {
      szdPopDel().then(() => {
        obj.row.deleFlag = true;
        deleteSessionTask({ taskAuthId: obj.row.taskAuthId, deleFlag: obj.row.deleFlag }).then(res => {
          if (res.code === 200) {
            props.mDg.retCode = "S";
            $mS("删除成功");
            getList();
          }
        });
      });
    } else if (obj.fCode === "deleNo") {
      obj.row.deleFlag = false;
      checkSessionTaskSkill(obj.row.taskAuthId, obj.row.skillCode);
      deleteSessionTask({ taskAuthId: obj.row.taskAuthId, deleFlag: obj.row.deleFlag }).then(res => {
        if (res.code === 200) {
          props.mDg.retCode = "S";
          $mS("撤回成功");
          getList();
        }
      });
    }
  };
</script>
