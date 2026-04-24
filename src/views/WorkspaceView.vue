<template>
	<el-container class="workspace-layout">
		<el-aside
			class="workspace-sidebar"
			:class="{ 'workspace-sidebar--collapsed': themeStore.workspaceSidebarCollapsed }"
			:width="themeStore.workspaceSidebarCollapsed ? '88px' : '280px'"
		>
			<div class="workspace-sidebar__top">
				<div class="workspace-brand">
					<p v-if="!themeStore.workspaceSidebarCollapsed" class="workspace-brand__eyebrow">Ryan LowCode</p>
					<h2>{{ themeStore.workspaceSidebarCollapsed ? 'RL' : '控制台' }}</h2>
				</div>
				<el-button circle class="workspace-sidebar__toggle" @click="themeStore.toggleWorkspaceSidebar()">
					<el-icon v-if="themeStore.workspaceSidebarCollapsed"><Expand /></el-icon>
					<el-icon v-else><Fold /></el-icon>
				</el-button>
			</div>
			<el-menu
				:default-active="activeMenu"
				class="workspace-menu"
				router
				:collapse="themeStore.workspaceSidebarCollapsed"
				background-color="transparent"
				text-color="var(--color-text-secondary)"
				active-text-color="var(--color-primary)"
			>
				<el-menu-item index="/workspace/projects">
					<el-icon><FolderOpened /></el-icon>
					<template #title>项目管理</template>
				</el-menu-item>
				<el-menu-item index="/workspace/designer">
					<el-icon><EditPen /></el-icon>
					<template #title>页面设计器</template>
				</el-menu-item>
				<el-menu-item v-if="authStore.user?.role === 'admin'" index="/workspace/admin">
					<el-icon><Setting /></el-icon>
					<template #title>管理员中心</template>
				</el-menu-item>
			</el-menu>
		</el-aside>

		<el-container>
			<el-header class="workspace-header">
				<div>
					<p class="workspace-header__label">工作区</p>
					<h1>{{ headerTitle }}</h1>
				</div>
				<div class="workspace-header__actions">
					<el-switch
						:model-value="themeStore.theme === 'dark'"
						inline-prompt
						active-text="夜"
						inactive-text="昼"
						@change="themeStore.toggleTheme()"
					/>
					<el-tag type="info">{{ authStore.user?.username || '未登录' }}</el-tag>
					<el-button text @click="handleLogout">退出</el-button>
				</div>
			</el-header>
			<el-main class="workspace-main">
				<router-view />
			</el-main>
		</el-container>
	</el-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import { useWorkspaceStore } from "@/stores/workspace";
import { Expand, Fold } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const workspaceStore = useWorkspaceStore();

const activeMenu = computed(() => route.path);
const headerTitle = computed(() => {
	if (route.path.includes("/workspace/admin")) return "管理员中心";
	if (route.path.includes("/workspace/designer")) return "页面设计器";
	return "项目管理";
});

const handleLogout = async () => {
	await authStore.logout();
	workspaceStore.reset();
	await router.replace("/login");
};
</script>

<style scoped>
.workspace-layout {
	min-height: 100vh;
	background: transparent;
}

.workspace-sidebar {
	padding: 24px 18px;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(242, 247, 255, 0.96) 100%);
	border-right: 1px solid var(--color-border-base);
	backdrop-filter: blur(18px);
	transition: width 0.28s ease, padding 0.28s ease;
	overflow: hidden;
}

.workspace-sidebar--collapsed {
	padding: 24px 10px;
}

.workspace-sidebar__top {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 10px;
	margin-bottom: 18px;
}

.workspace-sidebar__toggle {
	flex-shrink: 0;
	background: rgba(255, 255, 255, 0.88);
	border-color: var(--color-border-base);
	color: var(--color-text-primary);
}

.workspace-brand {
	padding: 10px 12px 8px;
	min-width: 0;
}

.workspace-brand__eyebrow,
.workspace-header__label {
	font-size: 12px;
	letter-spacing: 0.22em;
	text-transform: uppercase;
	color: var(--color-text-tertiary);
}

.workspace-brand h2,
.workspace-header h1 {
	margin-top: 8px;
	font-size: 26px;
	color: var(--color-text-primary);
}

.workspace-sidebar--collapsed .workspace-brand {
	padding: 8px 0;
	width: 100%;
	text-align: center;
}

.workspace-sidebar--collapsed .workspace-brand h2 {
	font-size: 22px;
	margin-top: 0;
}

.workspace-menu {
	border-right: none;
}

:deep(.workspace-menu.el-menu--collapse) {
	width: 100%;
}

:deep(.workspace-menu .el-menu-item) {
	height: 56px;
	line-height: 56px;
	border-radius: 16px;
	margin-bottom: 10px;
	font-size: 15px;
}

:deep(.workspace-menu .el-menu-item .el-icon) {
	font-size: 18px;
}

.workspace-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 28px;
	background: var(--color-bg-overlay);
	backdrop-filter: blur(18px);
	border-bottom: 1px solid var(--color-border-base);
	height: auto;
}

.workspace-header__actions {
	display: flex;
	align-items: center;
	gap: 14px;
}

.workspace-main {
	padding: 24px;
}
</style>
