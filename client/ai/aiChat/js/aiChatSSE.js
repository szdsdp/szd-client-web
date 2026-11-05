import { reactive, watch } from "vue";
import { useXStream } from "vue-element-plus-x";
import _ from "lodash";
import { $t } from "../../../common/utils/globalConfig";
import szdStoreCookie from "../../../common/store/storeCookie";
import szdDate from "../../../common/tools/date";
import { stopAiSessionStream, updateAiSessionDataJsonSt } from "../api/aiChat";

let aiSSE = null;
let stopWatch = null;
// axios中请求配置有baseURL选项，表示请求URL公共部分
const baseURL = process.env.VUE_APP_BASE_API || "";
const URL_SEND = baseURL + "/skis/ai/chat/session/content/send";
const URL_RECOVER = baseURL + "/skis/ai/chat/session/content/recover";
// 数据流默认分隔符（使用两个换行符，分割一条流数据）
const DEFAULT_STREAM_SEPARATOR = "\n\n";
// 分段默认分隔符（使用单个换行符，换行当前数据）
const DEFAULT_PART_SEPARATOR = "\n";
// 键值对默认分隔符（使用冒号）
const DEFAULT_KV_SEPARATOR = ":";
// 加载业务数据
export const c_data = ["approve", "analy", "analy_send"];
export const c_dom = ["collect"];
export const c_btn_mode_hide = ["skill_api_confirm"];
/**
 * 发送数据
 */
export function senderSend(sessionObj, contentList, btnMC, dg, aiFst, bsDataSend, obj, confirmObj = "", refAiChatMainContent) {
  //发送消息内容
  let messageSent = {
    sessionId: sessionObj.sessionId,
    userId: dg.userId,
    userName: dg.userName,
    groupCode: dg.groupCode,
    routerCode: dg.routerCode || "",
    btnMode: btnMC.btnMode,
    btnCode: btnMC.btnCode,
    message: obj?.content || "",
    pageDataJson: "",
    pageDomJson: "",
    fileList: _.cloneDeep(sessionObj.fileList),
    skillCode: sessionObj.$skill?.skillCode || "",
    skillSql: sessionObj.$skill?.skillSql || "",
    skillJson: confirmObj?.skillJson || "",
    contextMessageId: {
      turns: sessionObj.$senderTurns || 0,
      messageIds: sessionObj.$senderContextMsgIds
    }
  };
  if (!messageSent.message) {
    if (messageSent.btnMode === "skill_api_confirm") {
      messageSent.message = "确认执行Skill";
    } else if (confirmObj?.btnPage === true) {
      messageSent.message = "获取分页数据";
    }
  }
  //页面数据
  if (sessionObj.$senderDomData && bsDataSend) {
    messageSent.pageDataJson = typeof bsDataSend === "object" ? JSON.stringify(bsDataSend) : bsDataSend;
  }
  //页面字段
  if ((sessionObj.$senderDomData || c_dom.includes(messageSent.btnMode)) && aiFst) {
    messageSent.pageDomJson = typeof aiFst === "object" ? JSON.stringify(aiFst) : aiFst;
  }
  //发送的消息
  const aiMsgId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  let messageUser = reactive({
    messageId: "Q_" + aiMsgId,
    qaType: "Q",
    btnMode: messageSent.btnMode,
    btnCode: messageSent.btnCode,
    content: messageSent.message,
    createTime: szdDate.getDateTime(),
    fileJson: messageSent.fileList ? _.cloneDeep(messageSent.fileList) : [],
    error: ""
  });
  contentList.push(messageUser);
  //添加AI占位消息（content为null时BubbleList显示loading）
  let messageAi = reactive({
    messageId: "A_" + aiMsgId,
    qaType: "A",
    btnMode: messageSent.btnMode,
    btnCode: messageSent.btnCode,
    content: null,
    createTime: "",
    dataJson: null,
    error: ""
  });
  contentList.push(messageAi);
  //发送数据到Ai
  aiSSE = useXStream();
  startSSEStream(sessionObj, contentList, messageSent, messageUser, messageAi, URL_SEND, refAiChatMainContent).then();
}

/**
 * 发送消息给AI
 */
async function startSSEStream(sessionObj, contentList, messageSent, messageUser, messageAi, fetchUrl, refAiChatMainContent) {
  try {
    sessionObj.$senderLoading = true;
    const token = szdStoreCookie.getToken();
    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(messageSent)
    });
    if (!response.ok || !response.body) {
      throw new Error($t("发送AI失败") + ":" + response.status + " " + response.statusText);
    }
    //设置流式处理
    const readableStream = response.body;
    //接收监听内容
    let dataIndex = 0;
    stopWatch = watch(
      () => aiSSE.data.value.length,
      () => {
        if (!messageAi.createTime && aiSSE.data.value.length) {
          messageAi.createTime = szdDate.getDateTime();
        }
        for (; dataIndex < aiSSE.data.value.length; dataIndex++) {
          const item = aiSSE.data.value[dataIndex];
          switch (item.event) {
            case "snapshot":
              if (item.data) {
                try {
                  let snapshot = JSON.parse(item.data);
                  if (snapshot.messageId) messageAi.messageId = snapshot.messageId;
                  if (snapshot.createTime) messageAi.createTime = snapshot.createTime;
                  if (snapshot.content) messageAi.content = snapshot.content;
                  if (snapshot.dataJson) messageAi.dataJson = snapshot.dataJson;
                  if (snapshot.skillJson) messageAi.skillJson = snapshot.skillJson;
                  if (snapshot.skillSql) messageAi.skillSql = snapshot.skillSql;
                } catch (e) {
                  console.error("startSSEStream-snapshot数据转换错误", item.data);
                }
              }
              break;
            case "text":
              if (messageAi.content) {
                messageAi.content += item.data + DEFAULT_PART_SEPARATOR;
              } else {
                messageAi.content = item.data + DEFAULT_PART_SEPARATOR;
              }
              break;
            case "dataJson":
              if (item.data) {
                try {
                  messageAi.dataJson = JSON.parse(item.data);
                } catch (e) {
                  messageAi.dataJson = { error: "dataJson数据转换错误", data: item.data };
                  console.error("startSSEStream-dataJson数据转换错误", item.data);
                }
                //跳转到底部
                if (refAiChatMainContent?.value) refAiChatMainContent.value.scrollToBottom();
              }
              break;
            case "skillJson":
              if (item.data) {
                try {
                  messageAi.skillJson = JSON.parse(item.data);
                } catch (e) {
                  messageAi.skillJson = { error: "skillJson数据转换错误", data: item.data };
                  console.error("startSSEStream-skillJson数据转换错误", item.data);
                }
              }
              break;
            case "messageId":
              if (item.data) {
                let tempObj = JSON.parse(item.data);
                if (tempObj?.qaType === "Q" && tempObj.messageId) {
                  messageUser.messageId = tempObj.messageId;
                } else if (tempObj?.qaType === "A" && tempObj.messageId) {
                  messageAi.messageId = tempObj.messageId;
                }
              }
              break;
            case "error":
              messageUser.error += item.data + DEFAULT_PART_SEPARATOR;
              let _aIdx = contentList.findIndex(item => item.messageId === messageAi.messageId);
              if (_aIdx > -1) contentList.splice(_aIdx, 1);
              break;
            case "done":
              sessionObj.$senderLoading = false;
              break;
          }
        }
      },
      { immediate: true }
    );
    sessionObj.fileList = [];
    sessionObj.$skill = {};
    //转化流式输出
    await aiSSE.startStream({ readableStream });
  } catch (err) {
    console.error("catch-startSSEStream:", err);
    messageUser.error = "error:" + $t("生成内容错误，请重试");
    if (aiSSE) {
      messageUser.error += aiSSE.error;
      aiSSE.cancel();
    }
  } finally {
    sessionObj.$senderLoading = false;
    if (stopWatch) stopWatch();
    stopWatch = null;
  }
}

/**
 * 发送数据-终止
 */
export function senderStop(sessionObj, closeSSE) {
  sessionObj.$senderLoading = false;
  if (closeSSE) {
    stopAiSessionStream({ sessionId: sessionObj.sessionId }).then();
  }
  if (aiSSE) aiSSE.cancel();
  aiSSE = null;
  if (stopWatch) stopWatch();
  stopWatch = null;
}

/**
 * 恢复发送数据流式
 * */
export function senderRecovery(sessionObj, contentList, qMessageId, refAiChatMainContent) {
  let messageSent = { sessionId: sessionObj.sessionId, messageId: qMessageId };
  let messageUser = contentList.find(item => item.messageId === qMessageId);
  if (!messageUser) return;
  //添加AI占位消息（content为null时BubbleList显示loading）
  let messageAi = reactive({
    messageId: "A_" + qMessageId,
    qaType: "A",
    btnMode: messageUser.btnMode,
    btnCode: messageUser.btnCode,
    content: null,
    createTime: "",
    dataJson: null,
    error: ""
  });
  contentList.push(messageAi);
  //发送数据到Ai
  aiSSE = useXStream();
  startSSEStream(sessionObj, contentList, messageSent, messageUser, messageAi, URL_RECOVER, refAiChatMainContent).then();
}

/**
 * 更新返回结果变更信息
 * */
export function updDataJsonSt(confirmObj) {
  updateAiSessionDataJsonSt({ messageId: confirmObj.msgObj.messageId, dataJsonSt: confirmObj.dataSt }).then();
}

/**
 * 获取功能模式
 * */
export function getBtnMode(config, btnCode) {
  const btnObj = config.btnList.find(r => r.btnCode === btnCode);
  if (btnObj && btnObj.btnMode) return btnObj.btnMode;
  return "chat";
}

/**
 * 获取功能按钮和模式
 */
export function getBtnModeCode(config, obj, confirmObj) {
  let btnModeCode = {
    btnCode: confirmObj?.btnCode || obj?.btnCode || "chat",
    btnMode: ""
  };
  btnModeCode.btnMode = getBtnMode(config, btnModeCode.btnCode);
  return btnModeCode;
}

/**
 * 获取业务数据
 * */
export async function getBsDataSend(sessionObj, btnMC, bsDataObj, bsPageData, callMethod) {
  //无分页，直接返回页面数据
  if (!(sessionObj.$senderDomData || c_data.includes(btnMC.btnMode)) || bsPageData.page.total === 0 || !callMethod) {
    return bsDataObj;
  }
  //返回上次分页数据
  if (
    bsPageData.dataList.length > 0 &&
    bsPageData.page.pageNum === bsPageData.pagePrev.pageNum &&
    bsPageData.page.pageSize === bsPageData.pagePrev.pageSize
  ) {
    return bsPageData.dataList;
  }
  //回调接口进行分页
  const _resDataList = await callMethod({
    fCode: "$aiPageDataList",
    page: bsPageData.page,
    btnCode: btnMC.btnCode,
    btnMode: btnMC.btnMode
  });
  if (Array.isArray(_resDataList) && _resDataList.length > 0) {
    bsPageData.pagePrev.pageNum = bsPageData.page.pageNum;
    bsPageData.pagePrev.pageSize = bsPageData.page.pageSize;
    bsPageData.pagePrev.total = bsPageData.page.total;
    bsPageData.dataList = _resDataList;
  } else {
    bsPageData.dataList = [];
  }
  return bsPageData.dataList;
}
