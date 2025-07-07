import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { DndProvider } from "vue3-dnd";
import RyButton from "@/components/CommonComponents/RyButton.vue";
// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

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
