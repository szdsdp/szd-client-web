<template>
  <!-- 功能按钮 -->
  <div class="main-table-title">
    <div class="main-table-title-left" style="width: 50%">
      <span>{{ $t("个人开始值是1000/公司开始值是5000") }}</span>
    </div>
    <div class="main-table-title-right" style="width: 50%">
      <szd-button label="新增" link icon="Plus" @click="addRow" />
      <szd-button label="删除" link icon="Delete" @click="delRow" />
    </div>
  </div>
  <!-- 表格输出 -->
  <el-table border stripe :data="objData.perPromptList" @selection-change="handleSelRow">
    <el-table-column align="center" type="selection" width="40" />
    <el-table-column label="行号" prop="itemNo" width="80" align="center" />
    <el-table-column :label="$t('排序')" prop="promptSort" width="100">
      <template v-slot="scope">
        <szd-input-number v-model="scope.row.promptSort" :min="1" />
      </template>
    </el-table-column>
    <el-table-column prop="title" width="200">
      <template #header>
        <szd-table-col-header required label="提示词标题" helpTip="SKIS_AI_01B.promptTitle" />
      </template>
      <template v-slot="scope">
        <szd-input v-model="scope.row.title" :maxlength="50" clearable />
      </template>
    </el-table-column>
    <el-table-column prop="content" min-width="300">
      <template #header>
        <szd-table-col-header required label="提示词内容" helpTip="SKIS_AI_01B.promptContent" />
      </template>
      <template v-slot="scope">
        <szd-textarea v-model="scope.row.content" :maxlength="2000" :rows="3" clearable />
      </template>
    </el-table-column>
    <el-table-column :label="$t('功能按钮')" width="180">
      <template v-slot="scope">
        <szd-select v-if="btnArr && btnArr.length > 0" v-model="scope.row.btnCode" :baseArr="btnArr" clearable />
      </template>
    </el-table-column>
    <el-table-column :label="$t('Skill代码')" prop="skillCode" min-width="300">
      <template v-slot="scope">
        <szd-input-desc
          v-model="scope.row.skillCode"
          showHelp
          :help="{ a: 'SKIS_AI_SKILL_GRP', b: scope.row, c: ['skillCode', 'skillName'], d: [['groupCode', _objData.header.groupCode]] }"
          format="upper"
          clearable
          :descSpan="12"
          :desc="scope.row.skillName" />
      </template>
    </el-table-column>
    <!-- 删除  -->
    <el-table-column :label="$t('操作')" width="80" fixed="right" align="center">
      <template #default="scope">
        <szd-button label="删除" type="primary" link icon="Delete" @click="handleDelRow(scope.row)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
  import { computed, ref } from "vue";
  import { $mW, $t } from "../../../../common/utils/globalConfig";

  const emit = defineEmits(["update:objData"]);

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

  const addRow = () => {
    let itemNo = 0;
    let promptSort = 1000;
    for (let i = 0; i < _objData.value.perPromptList.length; i++) {
      if (itemNo < _objData.value.perPromptList[i].itemNo) itemNo = _objData.value.perPromptList[i].itemNo;
      if (promptSort < _objData.value.perPromptList[i].promptSort) promptSort = _objData.value.perPromptList[i].promptSort;
    }
    _objData.value.perPromptList.push({
      itemNo: Math.floor((itemNo + 10) / 10) * 10,
      promptSort: Math.floor((promptSort + 10) / 10) * 10,
      title: "",
      content: "",
      btnCode: "",
      skillCode: "",
      skillName: "",
      skillSql: ""
    });
  };

  //删除
  const delRow = () => {
    if (listSel.value.length === 0) {
      return $mW("请至少选择一行需要处理的数据");
    }
    _objData.value.perPromptList = _objData.value.perPromptList.filter(item => !listSel.value.some(ele => ele === item));
  };
  //选择行
  const handleSelRow = selection => {
    listSel.value = selection;
  };
  //删除行
  const handleDelRow = row => {
    _objData.value.perPromptList = _objData.value.perPromptList.filter(item => item !== row);
  };
</script>
