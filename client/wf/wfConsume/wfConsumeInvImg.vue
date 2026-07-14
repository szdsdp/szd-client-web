<template>
  <div class="app-sub-container szd__tb__wrapper" style="padding: 0">
    <el-table border stripe :data="_objData.invImg" class="flex-1" @selection-change="handleSelRow">
      <el-table-column align="center" type="selection" width="40" fixed="left" />
      <wfConsumeInvColCat />
    </el-table>
  </div>
</template>

<script setup>
  import { computed, onMounted } from "vue";
  import wfConsumeInvColCat from "./wfConsumeInvColCat.vue";
  import { wfEisConsumeImg } from "../api/wfComsume";

  const emit = defineEmits(["update:objData"]);

  const props = defineProps({
    bussParam: {
      type: Object
    },
    objData: {
      type: Object
    }
  });

  const _objData = computed({
    get: () => props.objData,
    set: val => {
      emit("update:objData", val);
    }
  });

  onMounted(() => {
    getData();
  });

  const getData = () => {
    wfEisConsumeImg(props.bussParam).then(res => {
      if (res.code === 200) {
        _objData.value.invImg = res.data;
      }
    });
  };

  const handleSelRow = selection => {
    _objData.value.invImgSel = selection;
  };
</script>
