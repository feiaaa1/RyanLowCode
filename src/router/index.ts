import { createRouter, createWebHistory } from "vue-router";

const routes = [
	{
		path: "/",
		name: "Designer",
		component: () => import("../../src/views/DesignerView.vue"),
	},
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

export default router;
