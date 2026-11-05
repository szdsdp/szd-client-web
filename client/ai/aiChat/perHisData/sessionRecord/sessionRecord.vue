<template>
  <div class="szd__tb__wrapper">
    <szd-sch-area :schLay="schLay" v-model="queryParams.ranges" :autoQuery="false" @handleEvent="handleSchEventImp" />
    <szd-table
      :layout="tabLay.layout"
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
  import { perListApi, deleteSessionChat } from "../../api/sessionRecord";
  import sessionRecordContent from "./sessionRecordContent.vue";

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
    layout: { report: "SKIS_AI_10A_PER", more: "6" },
    schCat: [
      { field: "groupCode", label: "会话组代码", type: "string", help: { a: "SKIS_AI_GROUP" } },
      { field: "title", label: "会话标题", type: "string", whereOpt: "SP" },
      { field: "deleFlag", label: "删除标记", type: "boolean" },
      { field: "taskFlag", label: "定时任务", type: "boolean" },
      { field: "updateTime", label: "更新时间", type: "datetime" }
    ]
  });
  //表格参数
  const tabLay = ref({
    layout: { report: "SKIS_AI_10A_PER", optionCell: "optionCell" },
    fieldCat: [
      { field: "sessionId", label: "会话ID", minWidth: 150, align: "center" },
      { field: "groupCode", label: "会话组代码", minWidth: 150 },
      { field: "groupName", label: "会话组名称", minWidth: 200 },
      { field: "title", label: "会话标题", minWidth: 200 },
      { field: "sessionHarness", label: "会话主题规范", type: "hlt", minWidth: 200 },
      { field: "routerCode", label: "路由代码", minWidth: 180, align: "center" },
      { field: "tokenUsed", label: "Token消耗", width: 120, type: "number", doSum: "1" },
      { field: "tokenTimes", label: "会话轮次", width: 120, type: "number", doSum: "1" },
      { field: "deleFlag", label: "删除标记", width: 100, align: "center" },
      { field: "taskFlag", label: "定时任务", width: 100, align: "center" },
      { field: "agentSessionId", label: "Agent会话ID", minWidth: 250, align: "center" },
      { field: "createTime", label: "创建时间", type: "datetime", minWidth: 150 },
      { field: "updateTime", label: "更新时间", type: "datetime", minWidth: 150 },
      {
        field: "operation",
        label: "操作",
        width: 120,
        align: "center",
        fixed: "right",
        type: "button",
        ctrlParam: [
          { fCode: "detail", label: "详情", icon: "View", link: true },
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
        for (let i = 0; i < dataList.value.length; i++) {
          setOptionCell(dataList.value[i]);
        }
      }
    });
  };
  //设置行操作按钮
  const setOptionCell = row => {
    row.optionCell = { operation: { deleYes: {}, deleNo: {} } };
    if (row.deleFlag || row.taskFlag) {
      row.optionCell.operation.deleYes = { hide: true };
    }
    if (!row.deleFlag || row.taskFlag) {
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
    } else if (obj.fCode === "deleYes") {
      szdPopDel().then(() => {
        obj.row.deleFlag = true;
        deleteSessionChat(obj.row).then(res => {
          if (res.code === 200) {
            props.mDg.retCode = "S";
            $mS("删除成功");
            getList();
          }
        });
      });
    } else if (obj.fCode === "deleNo") {
      obj.row.deleFlag = false;
      deleteSessionChat(obj.row).then(res => {
        if (res.code === 200) {
          props.mDg.retCode = "S";
          $mS("撤回成功");
          getList();
        }
      });
    }
  };
</script>
