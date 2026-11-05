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
  <el-table border stripe :data="objData.perKbList" @selection-change="handleSelRow">
    <el-table-column align="center" type="selection" width="40" />
    <el-table-column :label="$t('知识库ID')" prop="kbId" width="150" />
    <el-table-column :label="$t('知识库名称')" prop="kbName" width="250" />
    <el-table-column :label="$t('启用')" prop="status" width="80" align="center" />
    <el-table-column :label="$t('功能按钮')" width="180">
      <template v-slot="scope">
        <szd-select v-if="btnArr && btnArr.length > 0" v-model="scope.row.btnCode" :baseArr="btnArr" clearable />
      </template>
    </el-table-column>
    <el-table-column :label="$t('知识库备注')" prop="remark" min-width="300" />
    <el-table-column :label="$t('操作')" width="120" fixed="right" align="center">
      <template #default="scope">
        <szd-button label="编辑" type="primary" link icon="Edit" @click="handleEditRow(scope.row)" />
        <szd-button label="删除" type="primary" link icon="Delete" @click="handleDelRow(scope.row)" />
      </template>
    </el-table-column>
  </el-table>
  <subKnowledgeBase ref="refSubKnowledgeBase" @selectData="handleSelectData" />
  <subKnowledgeBaseInfo ref="refSubKnowledgeBaseInfo" @updResult="updResult" />
</template>

<script setup>
  import { computed, ref } from "vue";
  import { $mW, $t } from "../../../../common/utils/globalConfig";
  import subKnowledgeBase from "../subKnowledgeBase/subKnowledgeBase.vue";
  import subKnowledgeBaseInfo from "../subKnowledgeBase/subKnowledgeBaseInfo.vue";

  const emit = defineEmits(["update:objData"]);
  //子屏幕
  const refSubKnowledgeBase = ref();
  const refSubKnowledgeBaseInfo = ref();

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
    _objData.value.perKbList = _objData.value.perKbList.filter(item => !listSel.value.some(ele => ele === item));
  };
  //编辑
  const handleEditRow = row => {
    refSubKnowledgeBaseInfo.value.callKnowledgeBaseInfo({ option: "U", kbId: row.kbId, orgType: row.orgType, userId: row.userId });
  };
  //选择行
  const handleSelRow = selection => {
    listSel.value = selection;
  };
  //删除行
  const handleDelRow = row => {
    _objData.value.perKbList = _objData.value.perKbList.filter(item => item !== row);
  };
  //维护主数据
  const editMdm = () => {
    refSubKnowledgeBase.value.callSubKnowledgeBase();
  };
  //选择数据
  const handleSelectData = rows => {
    for (let i = 0; i < rows.length; i++) {
      let item = rows[i];
      _objData.value.perKbList.push({
        kbId: item.kbId,
        kbName: item.kbName,
        status: item.status,
        remark: item.remark,
        btnCode: ""
      });
    }
  };
  //更新数据
  const updResult = obj => {
    let row = _objData.value.perKbList.find(r => r.kid === obj.kid);
    if (row) {
      row.kbName = obj.kbName;
      row.status = obj.status;
      row.remark = obj.remark;
    }
  };
</script>
