<template>
	<div id="top-toolbar" class="top-toolbar">
		<div class="workspace-summary">
			<p class="workspace-summary__label">当前工作区</p>
			<h3>{{ workspaceStore.currentProject?.name || "未选择项目" }}</h3>
			<p class="workspace-summary__meta">
				{{ workspaceStore.currentPageName }}
				<span v-if="workspaceStore.lastSavedAt">· 上次保存 {{ formattedSavedAt }}</span>
			</p>
		</div>

		<div class="toolbar-actions">
			<el-button @click="goProjectManagement">切换项目</el-button>
			<el-button text @click="handleLogout">退出登录</el-button>
			<RyButton @click="handlePreviewClick" :style="{ padding: '4px 20px' }" text="预览" />
			<RyButton :style="{ padding: '4px 20px' }" text="导出" @click="handleExportClick" />
		</div>
		<el-dialog title="节点导出预览" width="600px" v-model="visible" @close="onClose">
			{{ formNodeTree }}
		</el-dialog>
	</div>
	<Preview :drawer="drawer" @update:drawer="drawer = $event" />
</template>

<script setup lang="ts">
import Preview from "@/components/DesignerView/Preview.vue";
import { useFormNodeTreeStore } from "@/stores/formNodeTree";
import { useWorkspaceStore } from "@/stores/workspace";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const workspaceStore = useWorkspaceStore();
const authStore = useAuthStore();
const { formNodeTree } = storeToRefs(useFormNodeTreeStore());

const drawer = ref(false);
const handlePreviewClick = () => {
	drawer.value = true;
};

const visible = ref(false);
const onClose = () => {
	visible.value = false;
};
const handleExportClick = () => {
	visible.value = true;
};

const formattedSavedAt = computed(() => {
	if (!workspaceStore.lastSavedAt) return "";
	return new Date(workspaceStore.lastSavedAt).toLocaleTimeString();
});

const goProjectManagement = async () => {
	await router.push("/workspace/projects");
};

const handleLogout = async () => {
	await authStore.logout();
	workspaceStore.reset();
	await router.replace("/login");
};
</script>

<style lang="scss" scoped>
.top-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 18px 10px;
	gap: 12px;
	border-bottom: 1px solid var(--color-border-base);
}

.workspace-summary {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
}

.workspace-summary__label {
	font-size: 12px;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: var(--color-text-tertiary);
}

.workspace-summary h3 {
	font-size: 18px;
	font-weight: 700;
	color: var(--color-text-primary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.workspace-summary__meta {
	font-size: 13px;
	color: var(--color-text-secondary);
}

.toolbar-actions {
	display: flex;
	align-items: center;
	gap: 10px;
}
</style>
