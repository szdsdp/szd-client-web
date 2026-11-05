<template>
  <div class="szd-ai-chat__content-list">
    <!-- 会话内容 -->
    <BubbleList
      v-if="_contentList && _contentList.length > 0"
      ref="refBubbleList"
      :list="_contentList"
      item-key="id"
      show-back-button
      alwaysShowScrollbar
      @load-more-top="handleLoadMore(1)">
      <!-- ====== 自定义头部 ====== -->
      <template #header="{ item }">
        <div v-if="item.createTime" class="header-wrapper">
          <el-icon><Clock /></el-icon>
          <span>{{ item.createTime }}</span>
        </div>
      </template>
      <!-- ====== 自定义气泡内容 ====== -->
      <template #content="{ item }">
        <!-- 内容信息 -->
        <aiChatMainContentMarkdown v-if="item.content" :content="item.content" />
        <!-- 文件列表 -->
        <div v-if="item.fileList?.length" class="szd-ai-chat__file-list">
          <template v-for="(file, index) in item.fileList">
            <FilesCard
              :uid="file.fileId"
              :name="file.fileName"
              showDelIcon
              @click="handleFileCardClick(file, $event)"
              @delete="handleFileCardDelete(item.fileList, file, index)">
            </FilesCard>
          </template>
        </div>
        <!-- AI返回Json数据 -->
        <aiChatMainContentData
          v-if="item.dataJson && item.qaType === 'A'"
          :messageObj="item"
          :contentDataSt="contentDataSt"
          :aiDomObj="aiDomObj"
          :bsDataObj="bsDataObj"
          :aiLay="aiLay"
          :szdopt="szdopt"
          :viewChat="viewChat"
          @handleEvent="handleEventData" />
        <!-- 生成AI内容错误 -->
        <el-alert v-if="item.error" :description="item.error" type="error" show-icon />
      </template>
      <!-- ======  自定义底部操作栏 ====== -->
      <template #footer="{ item }">
        <div class="footer-wrapper" :style="{ 'justify-content': item.qaType === 'A' ? 'flex-start' : 'flex-end' }">
          <el-tooltip
            v-if="item.qaType === 'Q' && contextSelected && !sessionObj.taskType && !viewChat"
            content="选择上下文"
            placement="top"
            effect="light">
            <el-switch
              v-model="contextSelected[item.messageId]"
              inline-prompt
              style="--el-switch-on-color: #13ce66; margin-right: 5px"
              size="default"
              active-text="Y"
              inactive-text="N" />
          </el-tooltip>
          <el-tooltip v-if="item.qaType === 'Q'" content="删除" placement="top" effect="light">
            <el-button type="danger" icon="Delete" size="small" circle @click="handleClickFooterDel(item)" />
          </el-tooltip>
          <el-tooltip content="会话详情" placement="top" effect="light">
            <el-button type="success" icon="Connection" size="small" circle @click="handleClickFooterSendAi(item)" />
          </el-tooltip>
          <el-tooltip content="复制" placement="top" effect="light">
            <el-button color="#626aef" icon="DocumentCopy" size="small" circle @click="handleClickFooterCopy(item)" />
          </el-tooltip>
          <el-tooltip v-if="item.qaType === 'A' && item.content" content="打印PDF" placement="top" effect="light">
            <el-button type="primary" icon="Printer" size="small" circle @click="mkExportPdf(item, $event)" />
          </el-tooltip>
          <el-tooltip v-if="item.qaType === 'A' && mkHasTable(item.content)" content="导出表格" placement="top" effect="light">
            <el-button color="#31b0d5" icon="Download" size="small" circle style="color: #fff" @click="mkExportTable(item)" />
          </el-tooltip>
          <el-tooltip v-if="item.qaType === 'A' && item.content" content="导出Word" placement="top" effect="light">
            <el-button color="#1abc9c" icon="Document" size="small" circle style="color: #fff" @click="mkExportWord(item, $event)" />
          </el-tooltip>
          <!-- 分页 -->
          <div
            v-if="item.qaType === 'A' && item.skillJson?.page?.pageAct && item.skillJson?.page?.total > 0 && !viewChat && szdopt !== 'V'"
            class="footer-wrapper-page">
            <szd-pagination
              :total="item.skillJson.page.total"
              v-model:page="item.skillJson.page.pageNum"
              v-model:limit="item.skillJson.page.pageSize"
              :pageSizes="item.skillJson.page.pageSizes"
              @pagination="handleSkillPage(item)"
              position="left" />
          </div>
        </div>
      </template>
    </BubbleList>
    <!-- 开启新会话 -->
    <div v-else class="szd-ai-chat__main-empty">{{ viewChat ? $t("无会话内容") : $t("开启会话") }}</div>

    <!-- 发送会话内容 -->
    <aiChatMainContentMessageView ref="refAiChatMainContentMessageView" />
  </div>
</template>

<script setup>
  import { computed, ref } from "vue";
  import szdFile from "../../../common/tools/fileTool";
  import { $mS, $t } from "../../../common/utils/globalConfig";
  import { BubbleList, FilesCard } from "vue-element-plus-x";
  import { mkExportPdf, mkExportTable, mkExportWord, mkHasTable } from "../js/aiChatMarkdownExport";
  import { deleteAiSessionFile, deleteAiSessionMessage } from "../api/aiChat";
  import aiChatMainContentMarkdown from "./aiChatMainContentMarkdown.vue";
  import aiChatMainContentData from "../subContentData/aiChatMainContentData.vue";
  import aiChatMainContentMessageView from "./aiChatMainContentMessageView.vue";

  const emit = defineEmits(["handleEvent", "refresh"]);

  const refBubbleList = ref();
  const refAiChatMainContentMessageView = ref();

  const props = defineProps({
    sessionObj: {
      type: Object,
      default: () => ({})
    },
    contentList: {
      type: Array,
      default: () => []
    },
    contentPage: {
      type: Object
    },
    contentDataSt: {
      type: Object
    },
    contextSelected: {
      type: Object
    },
    aiDomObj: {
      type: Object
    },
    bsDataObj: {
      type: [Object, Array]
    },
    aiLay: {
      type: Object
    },
    szdopt: {
      type: String
    },
    viewChat: {
      type: Boolean,
      default: false
    }
  });

  const _contentSkillJson = ref();

  const _contentList = computed(() => {
    let _list = [];
    _contentSkillJson.value = {};
    for (let i = 0; i < props.contentList.length; i++) {
      let message = props.contentList[i];
      _contentSkillJson.value[message.messageId] = message.skillJson || "";
      _list.push({
        id: message.messageId,
        messageId: message.messageId,
        btnMode: message.btnMode,
        btnCode: message.btnCode,
        qaType: message.qaType,
        qaMessageId: message.qaMessageId,
        content: message.content, //内容
        createTime: message.createTime,

        placement: message.qaType === "Q" ? "end" : "start", //气泡的位置
        variant: message.qaType === "Q" ? "filled" : "outlined", //气泡的样式变体
        maxWidth: "95%", // 气泡最大宽度
        loading: message.content === null || message.content === undefined, //流式还未输出

        fileList: message.fileJson || [], //用户上传的原始附件文件
        dataJson: message.dataJson || "", //AI本次生成的文件/代码交付产物
        dataJsonSt: message.dataJsonSt || "", //数据转化结果JSON
        pageDomJson: message.pageDomJson || "", //页面字段
        skillJson: _contentSkillJson.value[message.messageId], //技能JSON
        error: message.error || "" //错误消息
      });
    }
    return _list;
  });
  //翻页
  const handleLoadMore = next => {
    let maxPage = Math.ceil(props.contentPage.total / props.contentPage.pageSize);
    let nextPage = props.contentPage.pageNum + next;
    if (nextPage < 1) nextPage = 1;
    if (nextPage > maxPage) nextPage = maxPage;
    if (nextPage !== props.contentPage.pageNum) {
      props.contentPage.pageNum = nextPage;
      emit("refresh");
    }
  };
  //点击预览或下载文件
  const handleFileCardClick = (file, event) => {
    if (event && event.target.closest('.elx-files-card__del, .elx-files-card__close, [class*="del"], [class*="close"]')) {
      return;
    }
    if (szdFile.getFileViewType(file.fileName)) {
      szdFile.fileView({ src: file.fileUrl, fileName: file.fileName });
    } else {
      szdFile.downloadFile(file.fileUrl, file.fileName);
    }
  };
  //删除文件
  const handleFileCardDelete = (fileList, file, index) => {
    deleteAiSessionFile(file.fileId).then(res => {
      if (res.code === 200) {
        $mS("删除文件成功");
        fileList.splice(index, 1);
      }
    });
  };
  //处理Ai返回结果事件
  const handleEventData = obj => {
    emit("handleEvent", obj);
  };
  //删除数据
  const handleClickFooterDel = item => {
    deleteAiSessionMessage(item.messageId).then(res => {
      if (res.code === 200) {
        $mS("删除成功");
        let _idx = props.contentList.findIndex(r => r.messageId === item.messageId);
        if (_idx > -1) props.contentList.splice(_idx, 1);
        _idx = props.contentList.findIndex(r => r.qaMessageId === item.messageId);
        if (_idx > -1) props.contentList.splice(_idx, 1);
      }
    });
  };
  //发送AI内容
  const handleClickFooterSendAi = item => {
    refAiChatMainContentMessageView.value.callAiContentSendAiView(item);
  };
  //复制内容
  const handleClickFooterCopy = item => {
    try {
      navigator.clipboard.writeText(item.content);
    } catch (err) {
      console.error("Failed to copy content: ", err);
    }
  };
  //skill技能翻页
  const handleSkillPage = messageObj => {
    handleEventData({
      msgObj: messageObj,
      btnMode: messageObj.btnMode.endsWith("_page") ? messageObj.btnMode : messageObj.btnMode + "_page",
      btnCode: messageObj.btnCode.endsWith("_page") ? messageObj.btnCode : messageObj.btnCode + "_page",
      btnPage: true,
      closeAi: false,
      dataJs: "",
      dataSt: "",
      skillJson: messageObj.skillJson
    });
  };

  //跳转到底部
  const scrollToBottom = () => {
    refBubbleList.value.scrollToBottom();
  };
  defineExpose({ scrollToBottom });
</script>

<style lang="scss" scoped>
  .szd-ai-chat__content-list {
    width: 100%;
    flex: 1;
    overflow: hidden;

    :deep(.elx-bubble__header) {
      padding: 10px 2px;
    }

    :deep(.elx-bubble__content) {
      padding: 10px;
    }

    :deep(.elx-bubble__footer) {
      max-width: 95%;
    }

    :deep(.elx-bubble-list__list) {
      height: 100%;
      scrollbar-gutter: stable;
      padding: 10px;
      padding-inline: 20px;
    }

    .header-wrapper {
      display: flex;
      align-items: center;
      color: #409eff;

      span {
        margin-left: 3px;
      }
    }

    .footer-wrapper {
      display: flex;
      align-items: center;
      width: 100%;
      flex-wrap: wrap;

      :deep(.is-circle) {
        padding: 0;
        height: 26px;
        width: 26px;
      }

      .footer-wrapper-page {
        margin-left: 8px;
        background-color: #f0f2f5;
        border-radius: 4px;
        padding: 2px 8px;
      }
    }
  }
</style>
