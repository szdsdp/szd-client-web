<template>
  <el-dialog
    :title="$t('创建请求')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    @close="handleCloseForm"
    class="app-dialog-container"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="[600, 400]" />

    <el-form class="app-el-form">
      <el-row>
        <szd-input-form-item-col label="请求编号" v-model="objData.trCode" :maxlength="32" required disabled :span="24" />
        <szd-input-form-item-col label="请求名称" v-model="objData.trName" :maxlength="64" required :span="24" />
      </el-row>
    </el-form>

    <!-- 功能按钮 -->
    <div class="main-table-title" style="margin-top: 5px">
      <div class="main-table-title-left" style="width: 50%"></div>
      <div class="main-table-title-right" style="width: 50%">
        <szd-button label="新增" link icon="Plus" @click="addRow" />
      </div>
    </div>

    <el-table border stripe :data="objData.trUserList">
      <el-table-column prop="userId" :label="$t('用户ID')" min-width="35%">
        <template v-slot="scope">
          <szd-input v-model="scope.row.userId" showHelp :help="{ a: 'CORE_USER', b: scope.row, c: ['userId', 'userName'] }" format="upper" />
        </template>
      </el-table-column>
      <el-table-column prop="userName" :label="$t('用户姓名')" min-width="55%" />
      <el-table-column :label="$t('操作')" align="center" width="80" fixed="right">
        <template v-slot="scope">
          <szd-button label="删除" type="primary" link @click="handleDelRow(scope.row)" icon="Delete" />
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <szd-button label="保存" type="primary" @click="submitForm" />
      <szd-button label="关闭" type="primary" @click="closeForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref } from "vue";
  import { addTr } from "../api/tr.js";
  import { $mE, $mS, $t } from "../../common/utils/globalConfig";
  import { szdSh } from "../searchHelp/serchHelp";

  //定义事件
  const emit = defineEmits(["updResult"]);

  //功能参数
  const dg = ref({
    open: false
  });

  const objData = ref({
    trCode: "",
    trName: "",
    trUserList: []
  });

  const initNewTr = () => {
    objData.value.trCode = "";
    objData.value.trName = "";
    objData.value.trUserList = [];
    dg.value.open = true;
  };
  const addRow = () => {
    objData.value.trUserList.push({});
  };
  //删除行数据
  const handleDelRow = row => {
    objData.value.trUserList = objData.value.trUserList.filter(item => item !== row);
  };
  //保存
  const submitForm = () => {
    if (submitFormCheck()) {
      addTr(objData.value).then(response => {
        if (response.code === 200) {
          $mS("新增数据成功");
          closeForm();
          emit("updResult");
        }
      });
    }
  };
  const submitFormCheck = () => {
    if (!objData.value.trName) {
      $mE("请求名称不能为空");
      return false;
    }
    let ck = [];
    //自动移除空值
    objData.value.trUserList = objData.value.trUserList.filter(item => item.userId);
    //检查角色数据
    for (let i = 0; i < objData.value.trUserList.length; i++) {
      if (!objData.value.trUserList[i].userId) {
        $mE("用户ID不能为空");
        return false;
      }
      if (ck.includes(objData.value.trUserList[i].userId)) {
        $mE("用户ID重复");
        return false;
      }
      ck.push(objData.value.trUserList[i].userId);
    }
    return true;
  };

  //关闭
  const closeForm = () => {
    dg.value.open = false;
  };
  const handleCloseForm = () => {};

  //定义父组件可用方法
  defineExpose({
    initNewTr
  });
</script>