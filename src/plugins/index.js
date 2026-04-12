import { createPinia } from "pinia";
import router from "@/router";
import i18n from "./i18n";
// GlobalComponents
import sharedComponents from "./sharedComponents";
// Toast
import "vue-sonner/style.css";
// FloatingVue
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";
// VueDatePicker
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
// VueQuill
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
// ElementPlus
import ElementPlus from "element-plus";
import ElementTiptapPlugin from "element-tiptap";
// import ElementTiptap's styles
import "element-tiptap/lib/style.css";

export default {
  install(app) {
    // Register Plugins
    app.use(createPinia());
    app.use(i18n);
    app.use(router);
    app.use(FloatingVue);
    // use ElementPlus's plugin
    app.use(ElementPlus);
    // use this package's plugin
    app.use(ElementTiptapPlugin);
    // Register individual components
    app.component("VueDatePicker", VueDatePicker);
    app.component("QuillEditor", QuillEditor);
    // Register shared components
    sharedComponents.install(app);
    app.mount("#app");
  },
};
