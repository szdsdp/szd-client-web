<template>
  <el-dialog
    :title="dg.title"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    class="app-dialog-container"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="[1000, 500]" />

    <div style="margin-top: 10px" class="szd__tb__wrapper">
      <!-- 功能按钮 -->
      <div class="main-table-title">
        <div class="main-table-title-left" style="width: 50%"></div>
        <div class="main-table-title-right" style="width: 50%">
          <szd-button label="新增" link icon="Plus" @click="addRow" />
          <szd-button label="删除" link icon="Delete" @click="delRow" />
        </div>
      </div>
      <!-- 表格区域 -->
      <el-table border stripe :data="dg.dataList" id="dataList" @selection-change="handleSelRow" class="flex-1">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column :label="$t('行号')" align="center" width="55">
          <template v-slot="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <!-- 抄送用户 -->
        <el-table-column prop="ccUserId" :label="$t('抄送用户')" min-width="300">
          <template v-slot="scope">
            <szd-input-desc
              v-model="scope.row.ccUserId"
              showHelp
              :help="{ a: 'CORE_USER', b: scope.row, c: ['ccUserId-userId', 'ccUserName-userName'] }"
              :descSpan="14"
              :desc="scope.row.ccUserName" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('操作')" align="center" width="80">
          <template v-slot="scope">
            <szd-button label="删除" type="primary" link @click="handleDelRow(scope.row)" icon="Delete" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <szd-button label="保存" type="primary" @click="submitForm" />
      <szd-button label="关闭" type="primary" @click="closeForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { getWfCcUser, saveWfCcUser } from "../api/wfApi.js";
  import { $mE, $mS, $t } from "../../common/utils/globalConfig";

  //功能参数
  const dg = ref({
    title: "抄送用户",
    open: false,
    //表头数据
    header: {},
    //列表多选
    listSel: [],
    //数据
    dataList: []
  });

  //接受并处理
  const callWfButtonApprCc = wfInst => {
    dg.value.open = true;
    dg.value.header.wfGrpId = wfInst.wfGrpId;
    dg.value.header.wfId = wfInst.wfId;
    dg.value.header.nodeId = wfInst.nodeId;
    getCcUserList();
  };

  //确定
  const getCcUserList = () => {
    const json = { wfGrpId: dg.value.header.wfGrpId, wfId: dg.value.header.wfId, nodeId: dg.value.header.nodeId };
    getWfCcUser(json).then(res => {
      if (res.code === 200) {
        dg.value.dataList = res.data;
      } else {
        $mE(res.msg);
      }
    });
  };

  const addRow = () => {
    dg.value.dataList.push({});
  };

  //多选行
  const handleSelRow = selection => {
    dg.value.listSel = selection;
  };

  const delRow = () => {
    if (dg.value.listSel.length === 0) {
      $mE("请选择至少一行数据");
      return;
    }
    dg.value.dataList = dg.value.dataList.filter(item => !dg.value.listSel.some(ele => ele === item));
  };

  //单行删除
  const handleDelRow = row => {
    dg.value.dataList = dg.value.dataList.filter(item => item !== row);
  };

  //保存数据
  const submitForm = () => {
    if (submitFormCheck()) {
      let json = {
        header: dg.value.header,
        userList: dg.value.dataList
      };
      saveWfCcUser(json).then(res => {
        if (res.code === 200) {
          $mS("保存数据成功");
          getCcUserList();
        }
      });
    }
  };

  //检查提交数据
  const submitFormCheck = () => {
    let ckArr = [];
    for (let i = 0; i < dg.value.dataList.length; i++) {
      let _rowNo = i + 1;
      if (!dg.value.dataList[i].ccUserId) {
        $mE(_rowNo + "行用户不能为空");
        return false;
      }
      if (ckArr.includes(dg.value.dataList[i].ccUserId)) {
        $mE(_rowNo + "行用户重复");
        return false;
      } else {
        ckArr.push(dg.value.dataList[i].ccUserId);
      }
    }
    return true;
  };

  //关闭窗口
  const closeForm = () => {
    dg.value.open = false;
  };

  //定义父组件可用方法
  defineExpose({
    callWfButtonApprCc
  });
</script>
