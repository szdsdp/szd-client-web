<template>
  <div
    class="szd-ai-chat__main-sender"
    :class="{ 'szd-ai-chat__main-sender--dragover': isDragover && !isDisabled }"
    @dragenter.prevent="isDragover = true"
    @dragover.prevent
    @dragleave.prevent="isDragover = false"
    @drop.prevent="handleFileDrop">
    <!-- 上传附件 -->
    <input ref="refFileInput" class="upload-input" type="file" multiple @change="handleFileChange" />
    <!-- 会话输入框 -->
    <XSender
      ref="refXSender"
      :placeholder="$t('请输入内容')"
      :loading="sessionObj.$senderLoading"
      variant="updown"
      submit-type="enter"
      :custom-style="{ maxHeight: '200px' }"
      :disabled="isDisabled"
      clearable
      @submit="handleXSenderSubmit"
      @pasteFile="handleXSenderPasteFile">
      <!-- 附件信息 -->
      <template v-if="(sessionObj.fileList && sessionObj.fileList.length) || sessionObj.$skill?.skillName" #header>
        <div class="szd-ai-chat__file-list">
          <!-- 附件信息 -->
          <template v-if="sessionObj.fileList" v-for="file in sessionObj.fileList">
            <FilesCard
              :uid="file.uid"
              :name="file.fileName"
              :imgFile="file.raw"
              showDelIcon
              imgPreview
              :status="file.status"
              :percent="file.percent"
              @delete="handleFileDelete(file)"
              :hover-style="{ border: '2px solid #67c23a', 'background-color': '#f0f9eb' }" />
          </template>
          <!-- Skill技能 -->
          <div v-if="sessionObj.$skill?.skillName" class="szd-ai-chat__file-skill">
            <div class="skill-icon">{{ sessionObj.$skill.skillSql ? "SQL" : "SKILL" }}</div>
            <div class="skill-content">
              <div class="title">{{ sessionObj.$skill.skillName }}</div>
              <div class="title">{{ sessionObj.$skill.skillCode || sessionObj.$skill.skillSql }}</div>
            </div>
            <div class="skill-icon-delete">
              <el-icon @click="handleSkillDelete"><CircleCloseFilled /></el-icon>
            </div>
          </div>
        </div>
      </template>
      <!-- 工具栏前缀 -->
      <template #prefix>
        <!-- 上传附件 -->
        <el-button round plain size="small" :disabled="sessionObj.$senderLoading || isDisabled" icon="Paperclip" @click="refFileInput?.click()" />
        <!-- 选择提示词 -->
        <el-popover v-model:visible="isVisible" placement="top" width="650px" trigger="click">
          <template #reference>
            <el-button round plain size="small" :disabled="sessionObj.$senderLoading || isDisabled" icon="Tickets">
              {{ $t("提示词") }}
            </el-button>
          </template>
          <div class="szd-ai-chat__main-sender-prompt">
            <div v-if="config.promptList.length > 0" v-for="prompt in config.promptList" class="prompt-block" @click="handleClickPrompt(prompt)">
              <div class="title">{{ prompt.title }}</div>
              <div class="content">{{ prompt.content }}</div>
            </div>
            <div v-else class="prompt-block-empty">{{ $t("未维护提示词") }}</div>
          </div>
        </el-popover>
      </template>
      <!-- 工具栏后缀 -->
      <template #action-list>
        <div
          class="el-button el-button--primary el-button--small is-circle"
          :class="{ 'is-disabled': sessionObj.$senderLoading || isDisabled }"
          @mousedown="handleMicStart"
          @mouseup="handleMicEnd">
          <el-icon>
            <Microphone />
          </el-icon>
        </div>
        <el-button
          v-if="!sessionObj.$senderLoading"
          type="primary"
          size="small"
          :disabled="sessionObj.$senderLoading || isDisabled"
          icon="Top"
          circle
          @click="handleXSenderSubmit" />
        <el-button v-else plain size="small" :disabled="isDisabled" icon="VideoPause" circle @click="emit('stop')" />
      </template>
      <!-- 底部插槽 -->
      <template #footer>
        <div v-if="bsDataObj || config.btnList.find(r => r.btnCode !== 'chat')" class="footer-btn">
          <div v-if="!sessionObj.taskType" class="btn-input-number">
            <el-input-number v-model="sessionObj.$senderTurns" :min="0" :max="100" :precision="0" :disabled="handleTurnsDisabled()">
              <template #suffix>
                <span>{{ $t("轮次") }}</span>
              </template>
            </el-input-number>
          </div>
          <div v-if="bsDataObj" class="btn-checkbox" :class="{ 'is-disabled': sessionObj.$senderLoading || isDisabled }">
            <el-checkbox v-model="sessionObj.$senderDomData" :label="$t('含业务数据')" :disabled="sessionObj.$senderLoading || isDisabled" />
          </div>
          <template v-for="btnItem in config.btnList">
            <el-button
              v-if="btnItem.btnCode !== 'chat' && btnItem.btnMode && !c_btn_mode_hide.includes(btnItem.btnMode) && !btnItem.btnMode.endsWith('_page')"
              type="primary"
              :plain="btnItem.btnCode !== sessionObj.$senderBtnCode"
              size="small"
              :disabled="sessionObj.$senderLoading || isDisabled"
              @click="handleClickBtnCode(btnItem.btnCode)">
              {{ btnItem.btnName }}
            </el-button>
          </template>
        </div>
        <div v-if="props.bsPage?.total" class="footer-btn">
          <el-pagination
            v-model:current-page="props.bsPage.pageNum"
            v-model:page-size="props.bsPage.pageSize"
            :page-sizes="props.bsPage.pageSizes"
            :total="props.bsPage.total"
            size="small"
            :disabled="sessionObj.$senderLoading || isDisabled"
            layout="total, sizes, prev, pager, next, jumper" />
        </div>
      </template>
    </XSender>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from "vue";
  import { FilesCard, XSender, useRecord } from "vue-element-plus-x";
  import { $mW, $t } from "../../../common/utils/globalConfig";
  import { c_btn_mode_hide, c_data, getBtnMode } from "../js/aiChatSSE";

  //子屏幕
  const refFileInput = ref();
  const refXSender = ref();

  const emit = defineEmits(["send", "stop", "select-file", "remove-file"]);

  const props = defineProps({
    config: {
      type: Object,
      default: () => ({})
    },
    sessionObj: {
      type: Object,
      default: () => ({})
    },
    contextSelected: {
      type: Object
    },
    bsDataObj: {
      type: [Object, Array]
    },
    bsPage: {
      type: Object
    },
    mDg: {
      type: Object,
      default: () => ({})
    }
  });

  //是否拖动文件
  const isDragover = ref(false);
  const isVisible = ref(false);
  //是否可编辑
  const isDisabled = computed(() => {
    return props.sessionObj.$senderDisabled || !props.sessionObj.sessionId || props.sessionObj.taskStatus;
  });
  //设置对话框内容
  watch(
    () => props.sessionObj.sessionId,
    val => {
      refXSender.value?.clear();
      if (props.sessionObj.taskType && props.sessionObj.promptContent) {
        setTimeout(() => {
          refXSender.value?.setText(props.sessionObj.promptContent);
        }, 300);
      }
    }
  );

  //选中按钮
  const handleClickBtnCode = btnCode => {
    props.sessionObj.$senderBtnCode = props.sessionObj.$senderBtnCode === btnCode ? "chat" : btnCode;
    const btnMode = getBtnMode(props.config, props.sessionObj.$senderBtnCode);
    if (c_data.includes(btnMode)) {
      props.sessionObj.$senderDomData = true;
    } else if (c_data.includes(props.sessionObj.$senderBtnMode)) {
      props.sessionObj.$senderDomData = false;
    }
    props.sessionObj.$senderBtnMode = btnMode;
  };
  //发送数据
  const handleXSenderSubmit = () => {
    //获取内容
    const content = refXSender.value?.getModelValue().text.trim();
    if (!content) return;
    //发送的数据
    emit("send", { btnCode: props.sessionObj.$senderBtnCode || "chat", content: content });
    //清空数据
    refXSender.value?.clear();
  };
  //ref获取发送数据
  const getXSenderData = () => {
    //获取内容
    const content = refXSender.value?.getModelValue().text.trim();
    if (!content) return { content: "" };
    //清空数据
    refXSender.value?.clear();
    return { content: content };
  };

  //粘贴文件
  const handleXSenderPasteFile = (firstFile, fileList) => {
    emit("select-file", { fileList: fileList });
  };
  //上传文件
  const handleFileChange = event => {
    emit("select-file", { fileList: event.target.files });
  };
  //拖动上传文件
  const handleFileDrop = event => {
    isDragover.value = false;
    if (isDisabled.value) return;
    emit("select-file", { fileList: event.dataTransfer.files });
  };
  //删除文件
  const handleFileDelete = file => {
    emit("remove-file", { file: file });
  };
  //提示词选择
  const handleClickPrompt = prompt => {
    refXSender.value?.setText(prompt.content);
    if (prompt.btnCode && props.config.btnList.find(r => r.btnCode === prompt.btnCode)) {
      props.sessionObj.$senderBtnCode = "chat";
      handleClickBtnCode(prompt.btnCode);
    }
    if (prompt.skillCode) {
      props.sessionObj.$skill = { skillCode: prompt.skillCode, skillName: prompt.skillName, skillDesc: prompt.skillDesc };
    } else if (prompt.skillSql) {
      props.sessionObj.$skill = { skillSql: prompt.skillSql, skillName: $t("智能SQL") };
    }
    isVisible.value = false;
  };
  //删除提示词
  const handleSkillDelete = () => {
    props.sessionObj.$skill = {};
  };
  //轮次disabled
  const handleTurnsDisabled = () => {
    if (props.sessionObj.$senderLoading || isDisabled.value) return true;
    if (props.contextSelected && Object.values(props.contextSelected).some(v => v)) return true;
    return false;
  };

  /************** 语音处理 ******************/
  const micRecord = useRecord({ onEnd: handleRecordEnd });
  //语音处理
  const handleMicStart = async () => {
    if (props.sessionObj.$senderLoading || isDisabled.value) return;
    const micCheck = await checkMicAvailable();
    if (!micCheck.available) {
      $mW(`麦克风不可用: ${micCheck.message || micCheck.error}`);
      return;
    }
    micRecord.start();
  };
  //检查mic是否可用
  const checkMicAvailable = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return { available: true };
    } catch (err) {
      return { available: false, error: err.name, message: err.message };
    }
  };
  //关闭语音
  const handleMicEnd = () => {
    if (props.sessionObj.$senderLoading || isDisabled.value) return;
    micRecord.stop();
  };
  //语音处理结束
  function handleRecordEnd(res) {
    if (res) refXSender.value?.setText(res);
  }

  defineExpose({ getXSenderData });
</script>
<style lang="scss" scoped>
  .szd-ai-chat__main-sender {
    :deep(.is-circle) {
      padding: 0;
      height: 28px;
      width: 28px;
    }

    .btn-checkbox {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
      font-size: 12px;
      border: 1px solid #a0cfff;
      color: #409eff;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.2s;
      height: 28px;

      :deep(.el-checkbox__label) {
        color: #409eff;
        font-weight: 500;
        font-family: Arial;
      }

      &.is-disabled {
        cursor: not-allowed;
        opacity: 0.6;

        :deep(.el-checkbox__label) {
          color: #409eff;
        }
      }
    }

    .btn-input-number {
      width: 120px;
      .el-input-number {
        height: 28px;

        :deep(.el-input-number__decrease),
        :deep(.el-input-number__increase) {
          border-color: #a0cfff;
          background: #ecf5ff;
        }
        :deep(.el-input__wrapper) {
          box-shadow: 0 0 0 1px #a0cfff inset;
          border-radius: 3px;
          height: 28px;
          line-height: 28px;
          font-size: 12px;
        }
      }
    }

    .footer-btn {
      .el-button + .el-button {
        margin: 0;
      }
    }
  }
</style>
