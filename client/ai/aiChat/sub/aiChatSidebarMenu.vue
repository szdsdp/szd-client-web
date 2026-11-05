<template>
  <Conversations
    v-model:active="dg.sessionId"
    :items="menuList"
    showToTopBtn
    showBuiltInMenu
    :menuTeleported="false"
    row-key="sessionId"
    label-key="title"
    class="szd-ai-chat__sidebar-list"
    @change="handleActiveSession">
    <template #label="{ item }">
      <span class="szd-ai-chat__sidebar-list-item">
        <span class="label"> {{ item.title }}</span>
        <span v-if="mDg.chatMode === 'task'" :class="['task', item.taskStatus ? 'active' : '']">
          {{ item.taskStatus ? $t("已开启") : $t("未开启") }}
        </span>
      </span>
    </template>
    <!-- 自定义菜单 -->
    <template #menu="{ item }">
      <ul class="el-dropdown-menu szd-ai-chat__sidebar-list-menu">
        <li class="el-dropdown-menu__item" role="menuitem" @click="handleMenuClick('menuEdit', item)">
          <el-icon><Edit /></el-icon>
          {{ $t("编辑") }}
        </li>
        <li class="el-dropdown-menu__item" @click="handleMenuClick('menuDelete', item)">
          <el-icon><Delete /></el-icon>
          {{ $t("删除") }}
        </li>
        <template v-if="mDg.chatMode === 'task'">
          <li v-if="!item.taskStatus" class="el-dropdown-menu__item" @click="handleMenuClick('menuTaskOpen', item)">
            <el-icon><Open /></el-icon>
            {{ $t("开启任务") }}
          </li>
          <li v-else class="el-dropdown-menu__item" @click="handleMenuClick('menuTaskClose', item)">
            <el-icon><TurnOff /></el-icon>
            {{ $t("关闭任务") }}
          </li>
        </template>
      </ul>
    </template>
  </Conversations>
</template>

<script setup>
  import { ref } from "vue";
  import { Conversations } from "vue-element-plus-x";
  import { $t } from "../../../common/utils/globalConfig";

  const emit = defineEmits(["handleEvent"]);

  const props = defineProps({
    mDg: {
      type: Object,
      default: () => ({})
    },
    menuList: {
      type: Array,
      default: () => []
    }
  });

  const dg = ref({
    sessionId: ""
  });

  //切换激活会话
  const triggerActiveSession = sessionId => {
    const sessionObj = props.menuList.find(r => r.sessionId === sessionId);
    if (sessionObj) {
      dg.value.sessionId = sessionId;
    } else {
      dg.value.sessionId = "";
    }
  };

  //激活会话
  const handleActiveSession = obj => {
    const sessionObj = props.menuList.find(r => r.sessionId === obj.sessionId);
    emit("handleEvent", { fCode: "menuActive", sessionObj: sessionObj });
  };

  //点击菜单
  const handleMenuClick = (fCode, item) => {
    //关闭菜单
    const menu = document.querySelector(".szd-ai-chat__sidebar-list-menu");
    if (menu) {
      const popper = menu.closest(".el-dropdown__popper");
      if (popper) popper.style.display = "none";
    }
    emit("handleEvent", { fCode: fCode, sessionObj: item });
  };

  defineExpose({ triggerActiveSession });
</script>
