<template>
	<div class="project-management">
		<el-row :gutter="20">
			<el-col :span="15">
				<el-card shadow="hover" class="panel-card">
					<template #header>
						<div class="panel-header">
							<div>
								<p class="panel-header__eyebrow">Projects</p>
								<h3>我的项目</h3>
							</div>
							<div class="panel-header__actions">
								<el-button @click="openCreateDialog">新建项目</el-button>
								<el-button type="primary" :loading="workspaceStore.loadingProjects" @click="reloadProjects">刷新</el-button>
							</div>
						</div>
					</template>

					<el-table :data="workspaceStore.projects" height="520" @row-click="handleProjectRowClick">
						<el-table-column prop="name" label="项目名称" min-width="180" />
						<el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
						<el-table-column label="公开" width="90">
							<template #default="{ row }">
								<el-tag :type="row.isPublic ? 'success' : 'info'">{{ row.isPublic ? '公开' : '私有' }}</el-tag>
							</template>
						</el-table-column>
						<el-table-column label="更新时间" width="180">
							<template #default="{ row }">{{ formatDate(row.updatedAt) }}</template>
						</el-table-column>
						<el-table-column label="操作" width="260" fixed="right">
							<template #default="{ row }">
								<el-space wrap>
									<el-button link type="primary" @click.stop="editProject(row)">编辑</el-button>
									<el-button link @click.stop="goDesigner(row._id)">进入设计器</el-button>
									<el-button link @click.stop="openRuntime(row._id)">运行预览</el-button>
									<el-button link type="danger" @click.stop="removeProject(row._id)">删除</el-button>
								</el-space>
							</template>
						</el-table-column>
					</el-table>
				</el-card>
			</el-col>

			<el-col :span="9">
				<el-card shadow="hover" class="panel-card panel-card--stacked">
					<template #header>
						<div class="panel-header panel-header--column">
							<div class="panel-header__top">
								<div>
									<p class="panel-header__eyebrow">Pages</p>
									<h3>页面与历史版本</h3>
								</div>
								<el-select
									:model-value="workspaceStore.currentProjectId"
									placeholder="选择项目"
									style="width: 180px"
									@change="handleProjectSelect"
								>
									<el-option v-for="project in workspaceStore.projects" :key="project._id" :label="project.name" :value="project._id" />
								</el-select>
							</div>
							<div class="page-toolbar">
								<el-button size="small" :disabled="!workspaceStore.currentProjectId" @click="openCreatePageDialog">新建页面</el-button>
								<el-button size="small" :disabled="!workspaceStore.currentPageId" @click="openEditPageDialog">重命名</el-button>
								<el-button size="small" :disabled="!workspaceStore.currentPageId" @click="handleDuplicatePage">复制</el-button>
								<el-button size="small" type="success" :disabled="!workspaceStore.currentPageId" @click="handlePublishPage">发布</el-button>
								<el-button size="small" :disabled="!workspaceStore.currentPageId" @click="openCurrentRuntime">打开运行页</el-button>
								<el-button size="small" :disabled="!workspaceStore.currentProjectId" @click="submissionDialogVisible = true">提交记录</el-button>
								<el-button size="small" type="danger" :disabled="!workspaceStore.currentPageId" @click="handleDeletePage">删除</el-button>
							</div>
						</div>
					</template>

					<el-empty v-if="!workspaceStore.currentProjectId" description="请选择项目后查看页面和版本" />
					<template v-else>
						<el-scrollbar height="220">
							<el-menu :default-active="workspaceStore.currentPageId" class="page-menu">
								<el-menu-item v-for="page in workspaceStore.pages" :key="page._id" :index="page._id" @click="handlePageSelect(page._id)">
									<div class="page-menu__item">
										<div class="page-menu__item-main">
											<span>{{ page.name }}</span>
											<small>{{ page.status === 'published' ? '已发布' : '草稿' }}</small>
										</div>
										<el-tag size="small">v{{ page.version }}</el-tag>
									</div>
								</el-menu-item>
							</el-menu>
						</el-scrollbar>

						<el-divider>版本历史</el-divider>

						<el-timeline v-loading="workspaceStore.loadingHistory || workspaceStore.mutatingPage">
							<el-timeline-item
								v-for="item in workspaceStore.pageHistory"
								:key="item._id"
								:timestamp="formatDate(item.createdAt)"
								placement="top"
							>
								<el-card class="history-card">
									<div class="history-card__row">
										<strong>v{{ item.version }}</strong>
										<el-button link type="primary" @click="restoreVersion(item.version)">恢复</el-button>
									</div>
									<p>{{ item.changeDescription || '未填写变更说明' }}</p>
									<small>{{ item.changedBy.username }} · {{ item.changedBy.email }}</small>
								</el-card>
							</el-timeline-item>
						</el-timeline>
					</template>
				</el-card>
			</el-col>
		</el-row>

		<el-dialog v-model="dialogVisible" :title="editingProjectId ? '编辑项目' : '新建项目'" width="520px">
			<el-form :model="projectForm" label-position="top">
				<el-form-item label="项目名称">
					<el-input v-model="projectForm.name" maxlength="60" show-word-limit />
				</el-form-item>
				<el-form-item label="项目描述">
					<el-input v-model="projectForm.description" type="textarea" :rows="4" maxlength="200" show-word-limit />
				</el-form-item>
				<el-form-item label="可见性">
					<el-switch v-model="projectForm.isPublic" inline-prompt active-text="公开" inactive-text="私有" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="submitProject">保存</el-button>
			</template>
		</el-dialog>

		<el-dialog v-model="pageDialogVisible" :title="editingPageId ? '重命名页面' : '新建页面'" width="440px">
			<el-form :model="pageForm" label-position="top">
				<el-form-item label="页面名称">
					<el-input v-model="pageForm.name" maxlength="60" show-word-limit placeholder="例如：首页表单" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="pageDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="workspaceStore.mutatingPage" @click="submitPage">保存</el-button>
			</template>
		</el-dialog>
		<SubmissionHistoryDialog v-model="submissionDialogVisible" :project-id="workspaceStore.currentProjectId" />
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useWorkspaceStore } from "@/stores/workspace";
import { projectService } from "@/services/project";
import SubmissionHistoryDialog from "@/components/runtime/SubmissionHistoryDialog.vue";
import type { Project } from "@/types";

const router = useRouter();
const workspaceStore = useWorkspaceStore();
const dialogVisible = ref(false);
const pageDialogVisible = ref(false);
const submissionDialogVisible = ref(false);
const editingProjectId = ref("");
const editingPageId = ref("");
const projectForm = reactive({
	name: "",
	description: "",
	isPublic: false,
});
const pageForm = reactive({
	name: "",
});

const currentPage = computed(
	() => workspaceStore.pages.find((item) => item._id === workspaceStore.currentPageId) ?? null
);

const resetForm = () => {
	projectForm.name = "";
	projectForm.description = "";
	projectForm.isPublic = false;
	editingProjectId.value = "";
};

const resetPageForm = () => {
	pageForm.name = "";
	editingPageId.value = "";
};

const reloadProjects = async () => {
	await workspaceStore.loadProjects();
	if (workspaceStore.currentProjectId) {
		await workspaceStore.selectProject(workspaceStore.currentProjectId);
	}
};

const openCreateDialog = () => {
	resetForm();
	dialogVisible.value = true;
};

const editProject = (project: Project) => {
	editingProjectId.value = project._id;
	projectForm.name = project.name;
	projectForm.description = project.description ?? "";
	projectForm.isPublic = project.isPublic;
	dialogVisible.value = true;
};

const submitProject = async () => {
	if (!projectForm.name.trim()) {
		ElMessage.warning("请输入项目名称");
		return;
	}

	try {
		if (editingProjectId.value) {
			await projectService.update(editingProjectId.value, { ...projectForm });
			ElMessage.success("项目更新成功");
		} else {
			await projectService.create({ ...projectForm });
			ElMessage.success("项目创建成功");
		}
		dialogVisible.value = false;
		resetForm();
		await reloadProjects();
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "保存项目失败");
	}
};

const removeProject = async (projectId: string) => {
	try {
		await ElMessageBox.confirm("删除项目后无法恢复，是否继续？", "提示", { type: "warning" });
		await projectService.remove(projectId);
		ElMessage.success("项目已删除");
		await reloadProjects();
	} catch (error) {
		if (error !== "cancel") {
			ElMessage.error(error instanceof Error ? error.message : "删除项目失败");
		}
	}
};

const handleProjectRowClick = async (project: Project) => {
	await handleProjectSelect(project._id);
};

const handleProjectSelect = async (projectId: string) => {
	try {
		await workspaceStore.selectProject(projectId);
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "加载项目失败");
	}
};

const handlePageSelect = async (pageId: string) => {
	try {
		await workspaceStore.selectPage(pageId);
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "加载页面失败");
	}
};

const openCreatePageDialog = () => {
	if (!workspaceStore.currentProjectId) {
		ElMessage.warning("请先选择项目");
		return;
	}
	resetPageForm();
	pageDialogVisible.value = true;
};

const openEditPageDialog = () => {
	if (!currentPage.value) {
		ElMessage.warning("请先选择页面");
		return;
	}
	editingPageId.value = currentPage.value._id;
	pageForm.name = currentPage.value.name;
	pageDialogVisible.value = true;
};

const submitPage = async () => {
	if (!pageForm.name.trim()) {
		ElMessage.warning("请输入页面名称");
		return;
	}
	try {
		if (editingPageId.value) {
			await workspaceStore.updatePageMeta(editingPageId.value, { name: pageForm.name.trim() });
			ElMessage.success("页面重命名成功");
		} else {
			await workspaceStore.createPage(pageForm.name.trim());
			ElMessage.success("页面创建成功");
		}
		pageDialogVisible.value = false;
		resetPageForm();
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "保存页面失败");
	}
};

const handlePublishPage = async () => {
	if (!workspaceStore.currentPageId) return;
	try {
		await workspaceStore.publishPage(workspaceStore.currentPageId);
		ElMessage.success("页面已发布");
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "页面发布失败");
	}
};

const handleDeletePage = async () => {
	if (!workspaceStore.currentPageId) return;
	try {
		await ElMessageBox.confirm("删除页面后历史版本也会被删除，是否继续？", "提示", { type: "warning" });
		await workspaceStore.deletePage(workspaceStore.currentPageId);
		ElMessage.success("页面已删除");
	} catch (error) {
		if (error !== "cancel") {
			ElMessage.error(error instanceof Error ? error.message : "删除页面失败");
		}
	}
};

const handleDuplicatePage = async () => {
	if (!workspaceStore.currentPageId) return;
	try {
		await workspaceStore.duplicatePage(workspaceStore.currentPageId);
		ElMessage.success("页面复制成功");
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "复制页面失败");
	}
};

const restoreVersion = async (version: number) => {
	if (!workspaceStore.currentPageId) return;
	try {
		await workspaceStore.restorePageVersion(workspaceStore.currentPageId, version);
		ElMessage.success(`已恢复到版本 v${version}`);
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "恢复版本失败");
	}
};

const openRuntime = async (projectId: string) => {
	await handleProjectSelect(projectId);
	if (!workspaceStore.currentPageId) {
		ElMessage.warning("当前项目下还没有页面，请先新建页面");
		return;
	}
	window.open(`/runtime/${workspaceStore.currentPageId}`, "_blank");
};

const openCurrentRuntime = () => {
	if (!workspaceStore.currentPageId) {
		ElMessage.warning("请先选择页面");
		return;
	}
	window.open(`/runtime/${workspaceStore.currentPageId}`, "_blank");
};

const goDesigner = async (projectId: string) => {
	await handleProjectSelect(projectId);
	if (!workspaceStore.currentPageId) {
		ElMessage.warning("当前项目下还没有页面，请先新建页面");
		return;
	}
	await router.push("/workspace/designer");
};

const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : "-");

onMounted(async () => {
	await reloadProjects();
});
</script>

<style scoped>
.project-management {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.panel-card {
	border-radius: 22px;
}

.panel-card--stacked {
	min-height: 690px;
}

.panel-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 14px;
}

.panel-header--column {
	flex-direction: column;
	align-items: stretch;
}

.panel-header__top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 14px;
}

.panel-header__eyebrow {
	font-size: 11px;
	letter-spacing: 0.2em;
	text-transform: uppercase;
	color: var(--color-text-tertiary);
	margin-bottom: 6px;
}

.panel-header h3 {
	font-size: 22px;
	color: var(--color-text-primary);
}

.panel-header__actions,
.page-toolbar {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
}

.page-menu {
	border-right: none;
}

.page-menu__item,
.history-card__row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.page-menu__item-main {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.page-menu__item-main small,
.history-card small {
	color: var(--color-text-tertiary);
}

.history-card p {
	margin: 8px 0 6px;
	color: var(--color-text-secondary);
}
</style>
