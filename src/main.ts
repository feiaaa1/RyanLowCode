import { createApp } from "vue";
import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { DndProvider } from "vue3-dnd";
import RyButton from "@/components/CommonComponents/RyButton.vue";
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import webSee from "@websee/core";
import performance from "@websee/performance";
import recordscreen from "@websee/recordscreen";

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component);
}

app
	.use(router)
	.use(createPinia())
	.use(ElementPlus)
	.component("DndProvider", DndProvider)
	.component("RyButton", RyButton)
	.mount("#app");

app.use(webSee, {
	dsn: "http://172.16.202.228:8083/reportData",
	apikey: "project1",
	userId: "89757",
	silentWhiteScreen: true,
});

webSee.use(performance, {});
webSee.use(recordscreen, {});
