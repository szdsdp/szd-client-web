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
      @handleEvent="handleEventImp"
      @handleRowEvent="handleRowEventImp"
      @selection-change="handleSelRow"
      border
      stripe />
    <sessionRecordContent ref="refSessionRecordContent" />
  </div>
</template>

<script setup>
  import { onMounted, ref } from "vue";
  import { $mS, $mW } from "../../../../common/utils/globalConfig";
  import { perListApi, setReadFlagApi } from "../../api/sessionAutoTaskRecord";
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
  //查询参数
  const schLay = ref({
    layout: { report: "SKIS_AI_11B_PER", more: "6", showRule: "web_ai_sch_skis_ai_11b_pc" },
    schCat: [
      { field: "readFlag", label: "是否已读", type: "boolean" },
      { field: "bussDocId", label: "业务单号", type: "string" },
      { field: "createTime", label: "任务时间", type: "date" },
      { field: "taskType", label: "任务分类", type: "string", help: { a: "SKIS_AI_TASK_TYPE" } },
      { field: "conclusion", label: "处理结论", type: "string", help: { a: "SKIS_AI_CONCLUSION" } },
      { field: "groupCode", label: "会话组", type: "string", help: { a: "SKIS_AI_GROUP" } },
      { field: "title", label: "会话标题", type: "string", whereOpt: "SP" },
      { field: "btnCode", label: "功能按钮", type: "string", help: { a: "SKIS_AI_BTN" } },
      { field: "routerCode", label: "路由代码", type: "string", help: { a: "CORE_BSRO" } },
      { field: "skillCode", label: "Skill代码", type: "string", help: { a: "SKIS_AI_SKILL" } },
      { field: "bstp", label: "业务类型", type: "string", help: { a: "CORE_BSTP" } },
      { field: "nodeName", label: "节点名称", type: "string", whereOpt: "SP" },
      { field: "nodeId", label: "节点编码", type: "string" },
      { field: "taskAuthId", label: "任务授权ID", type: "string" },
      { field: "bussId", label: "单据ID", type: "string" },
      { field: "taskId", label: "待办ID", type: "string" },
      { field: "taskLight", label: "执行状态", type: "string", help: { a: "CORE_WF_LIGH" } }
    ]
  });
  //表格参数
  const tabLay = ref({
    layout: { report: "SKIS_AI_11B_PER", selection: "2", light: "taskLight" },
    toolbar: {
      btns: [
        { fCode: "read", label: "设置已读", icon: "Edit" },
        { fCode: "unRead", label: "设置未读", icon: "Edit" }
      ]
    },
    fieldCat: [
      { field: "autoTaskId", label: "自动任务ID", minWidth: 180, align: "center" },
      { field: "readFlag", label: "是否已读", minWidth: 100, align: "center" },
      { field: "conclusionName", label: "结论", minWidth: 150 },
      { field: "content", label: "内容", type: "hlt", minWidth: 300 },
      { field: "groupCode", label: "会话组代码", minWidth: 150 },
      { field: "groupName", label: "会话组名称", minWidth: 200 },
      { field: "title", label: "会话标题", minWidth: 250 },
      { field: "taskTypeName", label: "任务分类", minWidth: 180 },
      { field: "btnCodeName", label: "功能按钮", minWidth: 180 },
      { field: "bussDocId", label: "业务单号", minWidth: 180 },
      { field: "bussId", label: "单据ID", minWidth: 180 },
      { field: "taskId", label: "任务ID", minWidth: 180 },
      { field: "routerCode", label: "路由代码", minWidth: 180, align: "center" },
      { field: "skillName", label: "Skill名称", minWidth: 180 },
      { field: "bstp", label: "业务类型", minWidth: 180 },
      { field: "nodeId", label: "节点编码", minWidth: 180 },
      { field: "nodeName", label: "节点名称", minWidth: 180 },
      { field: "taskAuthId", label: "任务授权ID", minWidth: 180, align: "center" },
      { field: "sessionId", label: "会话ID", minWidth: 180, align: "center" },
      { field: "createTime", label: "创建时间", type: "datetime", minWidth: 150 },
      { field: "updateTime", label: "更新时间", type: "datetime", minWidth: 150 },
      {
        field: "operation",
        label: "操作",
        width: 80,
        align: "center",
        fixed: "right",
        type: "button",
        ctrlParam: [{ fCode: "detail", label: "详情", icon: "View", link: true }]
      }
    ],
    page: { pageNum: 1, pageSize: 20, total: 0 }
  });
  //数据
  const dataList = ref([]);
  const listSel = ref([]);

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
      }
    });
  };
  //查询
  const handleSchEventImp = fCode => {
    if (fCode === "$search") {
      tabLay.value.page.pageNum = 1;
      getList();
    }
  };
  // 表格按钮回调
  const handleEventImp = obj => {
    switch (obj.fCode) {
      case "read":
        handleSetRead(true);
        break;
      case "unRead":
        handleSetRead(false);
        break;
    }
  };
  //分页/排序请求
  const handleRequestImp = () => {
    getList();
  };
  //行按钮事件
  const handleRowEventImp = obj => {
    if (obj.fCode === "detail") {
      if (!obj.row.readFlag) {
        obj.row.readFlag = true;
        setReadFlagApi({ readFlag: true, autoTaskIdArr: [obj.row.autoTaskId] });
      }
      refSessionRecordContent.value.callSessionRecordContent("task", obj.row);
    }
  };
  //选择数据
  const handleSelRow = selection => {
    listSel.value = selection;
  };
  //设置读取状态
  const handleSetRead = readFlag => {
    let idArr = [];
    listSel.value.forEach(item => {
      if (item.readFlag !== readFlag) idArr.push(item.autoTaskId);
    });
    if (idArr.length === 0) {
      return $mW("请至少选择一行需要处理的数据");
    }
    setReadFlagApi({ readFlag: readFlag, autoTaskIdArr: idArr }).then(res => {
      if (res.code === 200) {
        $mS("操作成功");
        getList();
      }
    });
  };
</script>
