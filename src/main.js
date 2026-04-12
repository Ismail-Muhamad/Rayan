import "./assets/style.css";
import "./assets/main.css";
import { createApp } from "vue";
import InitApp from "@/plugins";
import App from "./App.vue";
// Create the app
const app = createApp(App);
// Install the plugin
app.use(InitApp);
