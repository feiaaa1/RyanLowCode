<template>
	<section class="workspace-panel">
		<header class="workspace-panel__header">
			<div>
				<p class="workspace-panel__eyebrow">Workspace</p>
				<h3>项目与页面</h3>
			</div>
			<el-button text :loading="workspaceStore.loadingProjects" @click="reloadProjects">刷新</el-button>
		</header>

		<div class="workspace-panel__group workspace-panel__group--large">
			<label>项目</label>
			<el-select
				:model-value="workspaceStore.currentProjectId"
				placeholder="请选择项目"
				filterable
				class="workspace-panel__select"
				@change="handleProjectChange"
			>
				<el-option
					v-for="project in workspaceStore.projects"
					:key="project._id"
					:label="project.name"
					:value="project._id"
				/>
			</el-select>
		</div>

		<div class="workspace-panel__group workspace-panel__group--fill">
			<div class="workspace-panel__group-header">
				<label>页面</label>
				<span>{{ workspaceStore.pages.length }} 个</span>
			</div>
			<div class="page-list" v-loading="workspaceStore.loadingPages">
				<button
					v-for="page in workspaceStore.pages"
					:key="page._id"
					class="page-item"
					:class="{ 'page-item--active': page._id === workspaceStore.currentPageId }"
					@click="handlePageChange(page._id)"
				>
					<strong>{{ page.name }}</strong>
					<span>v{{ page.version }} · {{ page.status }}</span>
				</button>
				<p v-if="!workspaceStore.loadingPages && !workspaceStore.pages.length" class="empty-text">
					当前项目下还没有页面。
				</p>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from "@/stores/workspace";
import { ElMessage } from "element-plus";

const workspaceStore = useWorkspaceStore();

const handleProjectChange = async (projectId: string) => {
	try {
		await workspaceStore.selectProject(projectId);
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "加载项目页面失败");
	}
};

const handlePageChange = async (pageId: string) => {
	try {
		await workspaceStore.selectPage(pageId);
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "加载页面失败");
	}
};

const reloadProjects = async () => {
	try {
		await workspaceStore.loadProjects();
		if (workspaceStore.currentProjectId) {
			await workspaceStore.selectProject(workspaceStore.currentProjectId);
		}
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "刷新项目失败");
	}
};
</script>

<style scoped>
.workspace-panel {
	width: 100%;
	height: 100%;
	padding: 28px;
	background: transparent;
	color: var(--color-text-primary);
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.workspace-panel__header,
.workspace-panel__group-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.workspace-panel__eyebrow {
	font-size: 12px;
	text-transform: uppercase;
	letter-spacing: 0.2em;
	color: var(--color-text-tertiary);
	margin-bottom: 6px;
}

.workspace-panel__header h3 {
	font-size: 26px;
	font-weight: 700;
}

.workspace-panel__group {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.workspace-panel__group--large {
	padding: 16px 18px;
	border-radius: 20px;
	background: color-mix(in srgb, var(--color-bg-overlay) 82%, transparent);
}

.workspace-panel__group--fill {
	flex: 1;
	min-height: 0;
	padding: 18px;
	border-radius: 24px;
	background: color-mix(in srgb, var(--color-bg-overlay) 82%, transparent);
}

.workspace-panel__select {
	width: 100%;
}

.page-list {
	display: flex;
	flex-direction: column;
	gap: 14px;
	min-height: 0;
	padding-top: 20px;
	overflow: auto;
	padding-right: 6px;
}

.page-item {
	text-align: left;
	padding: 20px 18px;
	border-radius: 20px;
	border: 1px solid var(--color-border-base);
	background: var(--color-bg-tertiary);
	cursor: pointer;
	display: flex;
	flex-direction: column;
	gap: 8px;
	transition: border-color 0.2s ease, transform 0.2s ease;
	color: var(--color-text-primary);
}

.page-item:hover,
.page-item--active {
	border-color: var(--color-primary);
	transform: translateY(-1px);
}

.page-item strong {
	font-size: 17px;
}

.page-item span,
.empty-text,
.workspace-panel__group-header span,
label {
	font-size: 14px;
	color: var(--color-text-secondary);
}
</style>
