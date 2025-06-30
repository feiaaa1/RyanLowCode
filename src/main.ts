import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { DndProvider } from "vue3-dnd";
import RyButton from "@/components/CommonComponents/RyButton.vue";

createApp(App)
	.use(router)
	.use(createPinia())
	.component("DndProvider", DndProvider)
	.component("RyButton", RyButton)
	.mount("#app");
