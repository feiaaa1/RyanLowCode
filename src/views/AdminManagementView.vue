<template>
	<div class="admin-management">
		<el-row :gutter="20">
			<el-col :span="14">
				<el-card class="panel-card" shadow="hover">
					<template #header>
						<div class="panel-header">
							<div>
								<p class="panel-header__eyebrow">Admin</p>
								<h3>所有项目</h3>
							</div>
							<el-button type="primary" :loading="workspaceStore.loadingAdminProjects" @click="reloadAdminData">刷新</el-button>
						</div>
					</template>
					<el-table :data="workspaceStore.adminProjects" height="560" @row-click="handleProjectSelect">
						<el-table-column prop="name" label="项目" min-width="180" />
						<el-table-column label="拥有者" min-width="180">
							<template #default="{ row }">{{ getOwnerName(row.owner) }}</template>
						</el-table-column>
						<el-table-column label="成员数" width="100">
							<template #default="{ row }">{{ row.members.length }}</template>
						</el-table-column>
						<el-table-column label="公开" width="90">
							<template #default="{ row }">
								<el-tag :type="row.isPublic ? 'success' : 'info'">{{ row.isPublic ? '公开' : '私有' }}</el-tag>
							</template>
						</el-table-column>
					</el-table>
				</el-card>
			</el-col>

			<el-col :span="10">
				<el-card class="panel-card" shadow="hover">
					<template #header>
						<div class="panel-header">
							<div>
								<p class="panel-header__eyebrow">Members</p>
								<h3>成员管理</h3>
							</div>
							<el-tag v-if="selectedProject">{{ selectedProject.name }}</el-tag>
						</div>
					</template>

					<el-empty v-if="!selectedProject" description="请选择左侧项目后管理成员" />
					<template v-else>
						<el-form inline class="member-form">
							<el-form-item>
								<el-select v-model="newMemberUserId" placeholder="选择用户" filterable style="width: 180px">
									<el-option v-for="user in workspaceStore.availableUsers" :key="user._id" :label="`${user.username} (${user.email})`" :value="user._id" />
								</el-select>
							</el-form-item>
							<el-form-item>
								<el-select v-model="newMemberRole" placeholder="角色" style="width: 120px">
									<el-option label="编辑者" value="editor" />
									<el-option label="查看者" value="viewer" />
								</el-select>
							</el-form-item>
							<el-form-item>
								<el-button type="primary" @click="handleAddMember">添加成员</el-button>
							</el-form-item>
						</el-form>

						<el-table :data="workspaceStore.projectMembers" v-loading="workspaceStore.loadingMembers" height="460">
							<el-table-column label="用户" min-width="220">
								<template #default="{ row }">
									<div class="member-user">
										<strong>{{ getMemberName(row.userId) }}</strong>
										<small>{{ getMemberEmail(row.userId) }}</small>
									</div>
								</template>
							</el-table-column>
							<el-table-column label="角色" width="140">
								<template #default="{ row }">
									<el-select
										:model-value="row.role"
										:disabled="row.role === 'owner'"
										style="width: 110px"
										@change="(role: string) => handleRoleChange(row.userId, role)"
									>
										<el-option label="拥有者" value="owner" disabled />
										<el-option label="编辑者" value="editor" />
										<el-option label="查看者" value="viewer" />
									</el-select>
								</template>
							</el-table-column>
							<el-table-column label="操作" width="100">
								<template #default="{ row }">
									<el-button link type="danger" :disabled="row.role === 'owner'" @click="handleRemoveMember(row.userId)">移除</el-button>
								</template>
							</el-table-column>
						</el-table>
					</template>
				</el-card>
			</el-col>
		</el-row>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useWorkspaceStore } from "@/stores/workspace";
import { projectService } from "@/services/project";
import type { Project, ProjectMemberRole, ProjectMemberUser, ProjectOwner } from "@/types";

const workspaceStore = useWorkspaceStore();
const selectedProjectId = ref("");
const newMemberUserId = ref("");
const newMemberRole = ref<ProjectMemberRole>("viewer");

const selectedProject = computed(() =>
	workspaceStore.adminProjects.find((project) => project._id === selectedProjectId.value) ?? null
);

const normalizeUser = (value: string | ProjectMemberUser | ProjectOwner) => {
	return typeof value === "string" ? null : value;
};

const getOwnerName = (owner: string | ProjectOwner) => normalizeUser(owner)?.username ?? owner;
const getMemberName = (member: string | ProjectMemberUser) => normalizeUser(member)?.username ?? member;
const getMemberEmail = (member: string | ProjectMemberUser) => normalizeUser(member)?.email ?? "";
const getMemberId = (member: string | ProjectMemberUser) => (typeof member === "string" ? member : member._id);

const reloadAdminData = async () => {
	await Promise.all([workspaceStore.loadAdminProjects(), workspaceStore.loadUsers()]);
	if (!selectedProjectId.value && workspaceStore.adminProjects.length) {
		await handleProjectSelect(workspaceStore.adminProjects[0]);
	}
};

const handleProjectSelect = async (project: Project) => {
	selectedProjectId.value = project._id;
	await workspaceStore.loadProjectMembers(project._id);
};

const handleAddMember = async () => {
	if (!selectedProjectId.value || !newMemberUserId.value) {
		ElMessage.warning("请选择项目和用户");
		return;
	}

	try {
		await projectService.addMember(selectedProjectId.value, {
			userId: newMemberUserId.value,
			role: newMemberRole.value,
		});
		ElMessage.success("成员添加成功");
		newMemberUserId.value = "";
		newMemberRole.value = "viewer";
		await reloadAdminData();
		await workspaceStore.loadProjectMembers(selectedProjectId.value);
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "添加成员失败");
	}
};

const handleRoleChange = async (member: string | ProjectMemberUser, role: string) => {
	if (!selectedProjectId.value || role === "owner") return;
	try {
		await projectService.updateMember(selectedProjectId.value, getMemberId(member), {
			role: role as Exclude<ProjectMemberRole, "owner">,
		});
		ElMessage.success("成员角色已更新");
		await reloadAdminData();
		await workspaceStore.loadProjectMembers(selectedProjectId.value);
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "更新角色失败");
	}
};

const handleRemoveMember = async (member: string | ProjectMemberUser) => {
	if (!selectedProjectId.value) return;
	try {
		await projectService.removeMember(selectedProjectId.value, getMemberId(member));
		ElMessage.success("成员已移除");
		await reloadAdminData();
		await workspaceStore.loadProjectMembers(selectedProjectId.value);
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "移除成员失败");
	}
};

onMounted(async () => {
	await reloadAdminData();
});
</script>

<style scoped>
.admin-management {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.panel-card {
	border-radius: 22px;
	min-height: 680px;
}

.panel-header {
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

.member-form {
	margin-bottom: 16px;
}

.member-user {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.member-user small {
	color: var(--color-text-tertiary);
}
</style>
