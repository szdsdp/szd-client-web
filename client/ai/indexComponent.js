//AI会话窗口
import aiChat from "./aiChat/aiChat.vue";
import aiChatDiv from "./aiChat/aiChatDiv.vue";

const installAiComponent = app => {
  app.component("szd-ai-chat", aiChat);
  app.component("szd-ai-chat-div", aiChatDiv);
};
export default installAiComponent;
