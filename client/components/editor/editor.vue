<template>
  <div class="l-editor-container szd__tb__wrapper" style="border: 1px solid #ccc">
    <!-- 工具栏 -->
    <Toolbar
      v-if="!hideBar"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      style="border-bottom: 1px solid #ccc; display: flex; justify-content: center; background: #fff" />
    <!-- 编辑器 -->
    <Editor
      v-model="html"
      :defaultConfig="editorConfig"
      @onChange="handleEditorChange"
      @onCreated="handleEditorCreated"
      class="flex-1"
      :class="classObj"
      style="overflow: hidden" />
  </div>
</template>

<script setup>
  import { ref, shallowRef, watch, onMounted, onBeforeUnmount } from "vue";
  import "@wangeditor/editor/dist/css/style.css";
  import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
  import { Boot, i18nChangeLanguage } from "@wangeditor/editor";
  import attachmentModule from "@wangeditor/plugin-upload-attachment";
  import szdStoreCookie from "../../common/store/storeCookie";

  if (!attachmentModule._registered) {
    Boot.registerModule(attachmentModule);
    attachmentModule._registered = true;
  }

  const emit = defineEmits(["contentHtmlUpdate", "contentTextUpdate"]);

  const props = defineProps({
    content: {
      default: ""
    },
    hideBar: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: "请输入内容..."
    },
    excludeKeys: {
      type: Array,
      default: () => ["group-video"]
    },
    toolbarKeys: {
      type: Array,
      default: () => []
    },
    uploadImgUrl: {
      type: String,
      default: ""
    },
    uploadAttachUrl: {
      type: String,
      default: ""
    },
    params: {
      type: Object,
      default: {}
    }
  });

  const editorRef = shallowRef();
  const html = ref(props.content);
  const classObj = ref({ "w-e-full-screen-styles": false });
  //工具栏菜单
  const toolbarConfig = {
    excludeKeys: props.excludeKeys,
    insertKeys: { index: 24, keys: ["uploadAttachment"] }
  };
  //编辑器配置
  const editorConfig = ref({
    placeholder: props.placeholder,
    hoverbarKeys: { attachment: { menuKeys: ["downloadAttachment"] } },
    //菜单配置
    MENU_CONF: {
      uploadImage: {
        server: props.uploadImgUrl, //服务端地址
        fieldName: "file",
        maxFileSize: 100 * 1024 * 1024,
        headers: { Authorization: "Bearer " + szdStoreCookie.getToken() },
        meta: props.params
      },
      uploadAttachment: {
        server: props.uploadAttachUrl,
        timeout: 5 * 1000,
        fieldName: "file",
        metaWithUrl: true, // meta拼接到url上
        headers: {
          Accept: "text/x-json",
          Authorization: "Bearer " + szdStoreCookie.getToken()
        },
        meta: props.params,
        maxFileSize: 10 * 1024 * 1024,
        //上传之前
        onBeforeUpload: file => {
          editorConfig.value.MENU_CONF.uploadAttachment.fieldName = file.name;
          return file;
        },
        // 上传进度
        onProgress: progress => {},
        // 上传成功
        onSuccess: (file, res) => {},
        // 上传失败
        onFailed: (file, res) => {
          alert(res.message);
        },
        // 上传错误
        onError: (file, err, res) => {
          alert(err.message);
          console.error("onError", file, err, res);
        },
        // 上传成功后，用户自定义插入文件
        customInsert: (res, file, insertFn) => {
          const url = res.data.url;
          if (!url) throw new Error(`url is empty`);
          insertFn(`${file.name}`, url);
        },
        // 插入到编辑器后的回调
        onInsertedAttachment(elem) {}
      }
    }
  });

  // 编辑器创建
  const handleEditorCreated = ed => {
    editorRef.value = Object.seal(ed);
    editorRef.value.on("fullScreen", () => {
      classObj.value["w-e-full-screen-styles"] = true;
    });
    editorRef.value.on("unFullScreen", () => {
      classObj.value["w-e-full-screen-styles"] = false;
    });
  };

  // 编辑器内容改变
  const handleEditorChange = ed => {
    emit("contentHtmlUpdate", ed.getHtml());
    emit("contentTextUpdate", ed.getText());
  };

  const selectLang = () => {
    const localLang = localStorage.getItem("szdLangMd5");
    if (localLang) {
      const lang = localLang.split("_")[1];
      if (["zh-CN", "en"].includes(lang)) {
        i18nChangeLanguage(lang);
      }
    }
  };

  watch(
    () => props.content,
    val => {
      html.value = val;
    }
  );

  onMounted(() => {
    selectLang();
    if (props.toolbarKeys.length > 0) {
      toolbarConfig.toolbarKeys = props.toolbarKeys;
    }
  });

  onBeforeUnmount(() => {
    if (editorRef.value == null) return;
    editorRef.value.destroy();
  });
</script>

<style lang="scss">
  .l-editor-container {
    height: 100%;
    overflow: hidden;

    ::-webkit-scrollbar {
      width: 5px;
      height: 5px;
      background: #fff;
    }

    ::-webkit-scrollbar-thumb {
      background: #eee;
    }
  }

  .w-e-full-screen-container {
    z-index: 10;

    .w-e-bar {
      .w-e-bar-item {
        .w-e-bar-item-menus-container {
          z-index: 15;
        }

        .w-e-menu-tooltip-v5 {
          &::before {
            z-index: 15;
          }

          &::after {
            z-index: 15;
          }
        }

        .w-e-drop-panel {
          z-index: 100;
        }

        .w-e-select-list {
          z-index: 15;
        }
      }
    }
  }

  .w-e-full-screen-styles {
    z-index: 10;
    background-color: rgb(245, 245, 245);

    .w-e-text-container {
      width: 50%;
      margin-left: 25%;
      box-shadow: 0 2px 10px #ccc;
      margin-top: 30px;
      max-height: 95%;
      padding-bottom: 30px;

      .w-e-scroll {
        padding: 20px 40px;
      }
    }

    ::-webkit-scrollbar {
      width: 5px;
      height: 5px;
      background: #fff;
    }

    ::-webkit-scrollbar-thumb {
      background: #eee;
    }
  }
</style>
