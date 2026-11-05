<template>
  <el-dialog
    :title="$t('业务规范')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    destroy-on-close
    align-center
    draggable>
    <div v-szd-dialog="['80%', '75%']" />
    <szd-sch-area :schLay="schLay" v-model="queryParams.ranges" @handleEvent="handleSchEventImp" />
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

    <template #footer>
      <div class="main-button">
        <div class="main-button-left" style="width: 70%">
          <szd-pagination
            :total="tabLay.page.total"
            v-model:page="tabLay.page.pageNum"
            v-model:limit="tabLay.page.pageSize"
            position="left"
            @pagination="getList" />
        </div>
        <div class="main-button-right" style="width: 30%">
          <szd-button label="确定" type="primary" @click="okayForm" />
          <szd-button label="关闭" type="primary" @click="closeForm" />
        </div>
      </div>
    </template>

    <subHarnessInfo ref="refSubHarnessInfo" @updResult="updResult" />
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import store from "~store";
  import { szdPopDel } from "../../../../common/message/popup";
  import { $t, $mS, $mW } from "../../../../common/utils/globalConfig";
  import { deleteApi, listApi } from "../../api/harness";
  import subHarnessInfo from "./subHarnessInfo.vue";

  const emit = defineEmits(["selectData"]);
  //子屏幕
  const refSubHarnessInfo = ref();

  //窗口参数
  const dg = ref({
    open: false,
    userId: store.state.loginUser.user.userId
  });
  //查询条件
  const queryParams = ref({
    ranges: {
      orgType: [{ type: "string", option: "EQ", low: "2" }]
    }
  });
  //查询条件参数
  const schLay = ref({
    layout: { report: "SKIS_AI_03B_PER", more: "6", span: 12 },
    schCat: [
      { field: "harnessId", label: "规范ID", type: "string" },
      { field: "harnessName", label: "规范名称", type: "string", whereOpt: "SP" },
      { field: "status", label: "是否启用", type: "boolean" },
      { field: "updateTime", label: "维护时间", type: "datetime" }
    ]
  });
  //表格输出参数
  const tabLay = ref({
    layout: { report: "SKIS_AI_03B_PER", pagination: "0", selection: "2" },
    toolbar: {
      btns: [{ fCode: "add", label: "新增", icon: "Plus" }]
    },
    fieldCat: [
      { field: "harnessId", label: "规范ID", width: 150, click: true },
      { field: "harnessName", label: "规范名称", minWidth: 250 },
      { field: "content", label: "规范内容", type: "hlt", minWidth: 500 },
      { field: "status", label: "启用", width: 80, align: "center" },
      { field: "createTime", label: "创建时间", type: "datetime", minWidth: 150 },
      { field: "updateTime", label: "修改时间", type: "datetime", minWidth: 150 },
      {
        field: "operation",
        label: "操作",
        width: 180,
        align: "center",
        fixed: "right",
        type: "button",
        ctrlParam: [
          { fCode: "sel", label: "选择", icon: "Edit", link: true },
          { fCode: "edit", label: "修改", icon: "Edit", link: true },
          { fCode: "del", label: "删除", icon: "Delete", link: true }
        ]
      }
    ],
    page: { pageNum: 1, pageSize: 20, total: 0 }
  });
  //输出数据
  const dataList = ref([]);
  //选择数据
  const listSel = ref([]);
  //打开窗口
  const callSubHarness = () => {
    dg.value.open = true;
    getList();
  };
  //查询列表
  const getList = () => {
    queryParams.value.ranges["userId"] = [{ type: "string", option: "EQ", low: dg.value.userId }];
    const params = {
      pageNum: tabLay.value.page.pageNum,
      pageSize: tabLay.value.page.pageSize,
      ranges: queryParams.value.ranges
    };
    listApi(params).then(res => {
      if (res.code === 200) {
        dataList.value = res.rows;
        tabLay.value.page.total = res.total || 0;
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
  //工具栏按钮事件
  const handleEventImp = obj => {
    if (obj.fCode === "add") {
      refSubHarnessInfo.value.callHarnessInfo({ option: "C", harnessId: "", orgType: "2", userId: dg.value.userId });
    }
  };
  //分页/排序请求
  const handleRequestImp = obj => {
    getList();
  };
  //行按钮事件
  const handleRowEventImp = obj => {
    if (obj.fCode === "edit") {
      refSubHarnessInfo.value.callHarnessInfo({ option: "U", harnessId: obj.row.harnessId, orgType: obj.row.orgType, userId: obj.row.userId });
    } else if (obj.fCode === "del") {
      deleteProcess(obj.row);
    } else if (obj.fCode === "sel" || (obj.fCode === "$click" && ["harnessId", "harnessName"].includes(obj.field))) {
      emit("selectData", [obj.row]);
      dg.value.open = false;
    }
  };
  //删除处理
  const deleteProcess = row => {
    szdPopDel().then(() => {
      deleteApi(row.harnessId).then(res => {
        if (res.code === 200) {
          $mS("删除成功");
          getList();
        }
      });
    });
  };
  //选择
  const handleSelRow = selection => {
    listSel.value = selection;
  };

  const okayForm = () => {
    if (listSel.value.length === 0) {
      $mW("请至少选择一行需要处理的数据");
    } else {
      emit("selectData", listSel.value);
      dg.value.open = false;
    }
  };

  const closeForm = () => {
    dg.value.open = false;
  };
  //刷新
  const updResult = () => {
    getList();
  };
  //调用方法
  defineExpose({ callSubHarness });
</script>
