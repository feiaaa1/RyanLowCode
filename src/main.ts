import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { DndProvider } from "vue3-dnd";
import RyButton from "@/components/CommonComponents/RyButton.vue";
// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import webSee from "@websee/core";
import performance from "@websee/performance";
import recordscreen from "@websee/recordscreen";

const app = createApp(App);
app
	.use(router)
	.use(createPinia())
	.component("DndProvider", DndProvider)
	.component("RyButton", RyButton)
	.mount("#app");

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component);
}

app.use(webSee, {
	dsn: "http://172.16.202.228:8083/reportData",
	apikey: "project1",
	userId: "89757",
	silentWhiteScreen: true,
});

webSee.use(performance, {});
webSee.use(recordscreen, {});
