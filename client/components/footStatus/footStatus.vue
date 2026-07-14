<template>
  <!-- 尾部状态栏显示 -->
  <div class="c-foot-status">
    <div v-for="(item, index) in status" :key="index" class="foot-status">
      <div v-if="item.lable && item.label !== ''" class="foot-label">{{ item.label }}:</div>
      <div v-if="item.status === 'E'" class="foot-value-red">{{ item.value }}</div>
      <div v-else-if="item.status === 'W'" class="foot-value-yellow">{{ item.value }}</div>
      <div v-else class="foot-value-blue">{{ item.value }}</div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    //数据示例  [{ label: '超标警告', status: 'W/E/S', value: '30%'}]
    status: {
      type: Array,
      default: []
    }
  });
</script>

<style lang="scss" scoped>
  .c-foot-status {
    display: flex;
    flex: 0;
    flex-wrap: nowrap;
    align-items: center;
    height: 30px;
    width: 100%;
    background-color: #f5f7fa;
    position: absolute;
    bottom: 0;
    border-top: 1px solid #e4e7ed;
    padding-left: 10px;
    font-size: $fz;
    font-weight: bolder;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .foot-status {
      display: flex;
      flex: 0;
      flex-wrap: nowrap;
      align-items: center;
    }

    .foot-label {
      color: #606266;
      padding-right: 5px;
    }

    .foot-value-yellow {
      color: #ddaa00;
      padding-right: 20px;
    }

    .foot-value-red {
      color: #d94646;
      padding-right: 20px;
    }

    .foot-value-blue {
      color: #1890ff;
      padding-right: 20px;
    }
  }
</style>
