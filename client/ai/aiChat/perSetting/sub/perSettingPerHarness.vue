<template>
  <!-- 功能按钮 -->
  <div class="main-table-title">
    <div class="main-table-title-left" style="width: 50%">
      <span>{{ $t("未维护按钮表示全部使用") }}</span>
    </div>
    <div class="main-table-title-right" style="width: 50%">
      <szd-button label="主数据/新增" link icon="Coin" @click="editMdm" />
      <szd-button label="删除" link icon="Delete" @click="delRow" />
    </div>
  </div>
  <!-- 表格输出 -->
  <el-table border stripe :data="_objData.perHarnessList" @selection-change="handleSelRow">
    <el-table-column align="center" type="selection" width="40" />
    <el-table-column :label="$t('业务规范ID')" prop="harnessId" width="150" />
    <el-table-column :label="$t('业务规范名称')" prop="harnessName" width="250" />
    <el-table-column :label="$t('启用')" prop="status" width="80" align="center" />
    <el-table-column :label="$t('功能按钮')" width="200">
      <template v-slot="scope">
        <szd-select v-if="btnArr && btnArr.length > 0" v-model="scope.row.btnCode" :baseArr="btnArr" clearable />
      </template>
    </el-table-column>
    <el-table-column :label="$t('业务规范内容')" prop="content" min-width="500">
      <template v-slot="scope">
        <szd-hlt-div :code="scope.row.content" :length="50" />
      </template>
    </el-table-column>
    <el-table-column :label="$t('操作')" width="120" fixed="right" align="center">
      <template #default="scope">
        <szd-button label="编辑" type="primary" link icon="Edit" @click="handleEditRow(scope.row)" />
        <szd-button label="删除" type="primary" link icon="Delete" @click="handleDelRow(scope.row)" />
      </template>
    </el-table-column>
  </el-table>
  <subHarness ref="refSubHarness" @selectData="handleSelectData" />
  <subHarnessInfo ref="refSubHarnessInfo" @updResult="updResult" />
</template>

<script setup>
  import { computed, ref } from "vue";
  import { $mW, $t } from "../../../../common/utils/globalConfig";
  import subHarness from "../subHarness/subHarness.vue";
  import subHarnessInfo from "../subHarness/subHarnessInfo.vue";

  const emit = defineEmits(["update:objData"]);
  //子屏幕
  const refSubHarness = ref();
  const refSubHarnessInfo = ref();

  const props = defineProps({
    objData: {
      type: Object
    },
    btnArr: {
      type: Array
    }
  });

  const _objData = computed({
    get: () => props.objData,
    set: val => {
      emit("update:objData", val);
    }
  });
  //选择数据
  const listSel = ref([]);
  //删除
  const delRow = () => {
    if (listSel.value.length === 0) {
      return $mW("请至少选择一行需要处理的数据");
    }
    _objData.value.perHarnessList = _objData.value.perHarnessList.filter(item => !listSel.value.some(ele => ele === item));
  };
  //编辑
  const handleEditRow = row => {
    refSubHarnessInfo.value.callHarnessInfo({ option: "U", harnessId: row.harnessId, orgType: row.orgType, userId: row.userId });
  };
  //选择行
  const handleSelRow = selection => {
    listSel.value = selection;
  };
  //删除行
  const handleDelRow = row => {
    _objData.value.perHarnessList = _objData.value.perHarnessList.filter(item => item !== row);
  };
  //维护主数据
  const editMdm = () => {
    refSubHarness.value.callSubHarness();
  };
  //选择数据
  const handleSelectData = rows => {
    for (let i = 0; i < rows.length; i++) {
      let item = rows[i];
      _objData.value.perHarnessList.push({
        harnessId: item.harnessId,
        harnessName: item.harnessName,
        content: item.content,
        status: item.status,
        btnCode: ""
      });
    }
  };
  //更新数据
  const updResult = obj => {
    let row = _objData.value.perHarnessList.find(r => r.harnessId === obj.harnessId);
    if (row) {
      row.harnessName = obj.harnessName;
      row.status = obj.status;
      row.content = obj.content;
    }
  };
</script>
