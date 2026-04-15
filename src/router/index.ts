import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
	{
		path: "/login",
		name: "Login",
		component: () => import("@/views/LoginView.vue"),
		meta: { guestOnly: true },
	},
	{
		path: "/runtime/:pageId",
		name: "RuntimePage",
		component: () => import("@/views/RuntimePageView.vue"),
		meta: { public: true },
	},
	{
		path: "/",
		redirect: "/workspace/projects",
	},
	{
		path: "/workspace",
		name: "Workspace",
		component: () => import("@/views/WorkspaceView.vue"),
		meta: { requiresAuth: true },
		children: [
			{
				path: "projects",
				name: "ProjectManagement",
				component: () => import("@/views/ProjectManagementView.vue"),
				meta: { requiresAuth: true },
			},
			{
				path: "designer",
				name: "Designer",
				component: () => import("@/views/DesignerView.vue"),
				meta: { requiresAuth: true },
			},
			{
				path: "admin",
				name: "AdminManagement",
				component: () => import("@/views/AdminManagementView.vue"),
				meta: { requiresAuth: true, requiresAdmin: true },
			},
		],
	},
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

router.beforeEach(async (to) => {
	if (to.meta.public) {
		return true;
	}

	const authStore = useAuthStore();
	if (!authStore.initialized) {
		await authStore.fetchCurrentUser();
	}

	if (to.meta.requiresAuth && !authStore.isAuthenticated) {
		return { path: "/login", query: { redirect: to.fullPath } };
	}

	if (to.meta.requiresAdmin && authStore.user?.role !== "admin") {
		return { path: "/workspace/projects" };
	}

	if (to.meta.guestOnly && authStore.isAuthenticated) {
		return { path: "/workspace/projects" };
	}

	return true;
});

export default router;
