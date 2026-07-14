<template>
  <el-dialog
    :title="$t('消息提示')"
    v-model="dg.open"
    append-to-body
    :close-on-click-modal="false"
    @close="handleClose"
    class="app-dialog-container"
    align-center
    destroy-on-close
    draggable>
    <div v-szd-dialog="[700, 450]" />
    <el-table border stripe :data="msg" class="flex-1">
      <el-table-column :label="$t('标识')" prop="light" min-width="50" align="center">
        <template #default="scope">
          <szd-light :light="scope.row.light" />
        </template>
      </el-table-column>
      <el-table-column prop="retCode" :label="$t('消息码')" width="100" />
      <el-table-column prop="retMsg" :label="$t('消息内容')" min-width="400" />
    </el-table>

    <template #footer>
      <szd-button v-if="okayFlag" label="确认" type="primary" @click="okayForm" />
      <szd-button v-if="okayFlag" label="取消" type="primary" @click="handleCloseForm" />
      <szd-button v-if="!okayFlag" label="关闭" type="primary" @click="handleCloseForm" />
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { $t } from "../../common/utils/globalConfig";
  //定义事件
  const emit = defineEmits(["okay", "closeForm"]);

  const props = defineProps({
    msg: {
      type: Array,
      default: []
    },
    okayFlag: {
      type: Boolean,
      default: false
    }
  });

  //功能参数
  const dg = ref({
    open: false
  });

  onMounted(() => {
    dg.value.open = true;
  });

  //数据确定
  const okayForm = () => {
    emit("okay");
    dg.value.open = false;
  };

  const handleCloseForm = () => {
    dg.value.open = false;
  };

  const handleClose = () => {
    emit("closeForm");
  };
</script>