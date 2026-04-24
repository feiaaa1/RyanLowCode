<template>
	<div colorTransition id="designer-view" class="designer-view">
		<div v-if="workspaceError" class="designer-banner designer-banner--error">
			{{ workspaceError }}
		</div>
		<div v-else-if="!workspaceStore.currentPageId" class="designer-banner">
			请先在“项目管理”中选择一个项目和页面，再进入设计器。
		</div>

		<div class="designer-layout">
			<section class="designer-panel designer-panel--left">
				<el-card shadow="hover" class="designer-card designer-card--full">
					<PanelTabs />
				</el-card>
			</section>
			<section class="designer-panel designer-panel--center">
				<el-card shadow="hover" class="designer-card designer-card--full designer-card--canvas">
					<Topbar />
					<Toolbar />
					<DesignCanvas />
				</el-card>
			</section>
			<section class="designer-panel designer-panel--right">
				<el-card shadow="hover" class="designer-card designer-card--full">
					<PropertyPanel />
				</el-card>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useWorkspaceStore } from "@/stores/workspace";
import { useFormNodeTreeStore } from "@/stores/formNodeTree";

const workspaceStore = useWorkspaceStore();
const formNodeTreeStore = useFormNodeTreeStore();
const workspaceError = ref("");

const bootstrapWorkspace = async () => {
	workspaceError.value = "";
	try {
		if (!workspaceStore.projects.length) {
			await workspaceStore.loadProjects();
		}
		if (workspaceStore.currentProjectId && !workspaceStore.currentPageId) {
			await workspaceStore.selectProject(workspaceStore.currentProjectId);
		}
		if (!workspaceStore.projects.length) {
			workspaceError.value = "当前账号下没有项目，请先在项目管理中创建项目和页面。";
		}
	} catch (error) {
		workspaceError.value = error instanceof Error ? error.message : "工作区加载失败";
		ElMessage.error(workspaceError.value);
	}
};

watch(
	() => workspaceStore.currentPage?.formNodeTree,
	(value) => {
		if (value) {
			formNodeTreeStore.replaceFormNodeTree(value);
		}
	},
	{ immediate: true }
);

onMounted(async () => {
	await bootstrapWorkspace();
});
</script>

<style lang="scss" scoped>
.designer-view {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.designer-layout {
	display: grid;
	grid-template-columns: minmax(420px, 1.25fr) minmax(920px, 2.1fr) minmax(420px, 1.15fr);
	gap: 24px;
	min-height: calc(100vh - 170px);
	align-items: stretch;
}

.designer-panel,
.designer-card,
.designer-card--full {
	height: 100%;
	min-height: calc(100vh - 170px);
}

.designer-card {
	border-radius: 28px;
	overflow: hidden;
}

.designer-card--canvas {
	display: flex;
	flex-direction: column;
}

.designer-banner {
	padding: 14px 18px;
	font-size: 15px;
	border: 1px solid var(--color-border-base);
	border-radius: 18px;
	color: var(--color-text-secondary);
	background: color-mix(in srgb, var(--color-primary) 8%, var(--color-bg-tertiary));
}

.designer-banner--error {
	color: var(--color-danger);
	background: rgba(220, 38, 38, 0.08);
}

@media (max-width: 1700px) {
	.designer-layout {
		grid-template-columns: minmax(360px, 1fr) minmax(780px, 1.7fr) minmax(360px, 1fr);
	}
}
</style>
