import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { projectService } from "@/services/project";
import { pageService } from "@/services/page";
import { createRootFormNode, normalizeFormNodeTree } from "@/utils/formSchema";
import type {
	FormNode,
	Page,
	PageHistoryItem,
	PageListItem,
	Project,
	ProjectMember,
	ProjectUser,
} from "@/types";

const createEmptyFormTree = (): FormNode[] => [createRootFormNode()];

export const useWorkspaceStore = defineStore("workspace", () => {
	const projects = ref<Project[]>([]);
	const adminProjects = ref<Project[]>([]);
	const availableUsers = ref<ProjectUser[]>([]);
	const pages = ref<PageListItem[]>([]);
	const pageHistory = ref<PageHistoryItem[]>([]);
	const projectMembers = ref<ProjectMember[]>([]);
	const currentProjectId = ref("");
	const currentPageId = ref("");
	const currentPage = ref<Page | null>(null);
	const loadingProjects = ref(false);
	const loadingAdminProjects = ref(false);
	const loadingUsers = ref(false);
	const loadingPages = ref(false);
	const loadingHistory = ref(false);
	const loadingMembers = ref(false);
	const savingPage = ref(false);
	const mutatingPage = ref(false);
	const lastSavedAt = ref("");

	const currentProject = computed(
		() =>
			projects.value.find((project) => project._id === currentProjectId.value) ??
			adminProjects.value.find((project) => project._id === currentProjectId.value) ??
			null
	);

	const currentPageName = computed(() => currentPage.value?.name ?? "未命名页面");

	const loadProjects = async () => {
		loadingProjects.value = true;
		try {
			const response = await projectService.list();
			projects.value = response.data ?? [];
			if (!projects.value.length) {
				currentProjectId.value = "";
				pages.value = [];
				currentPageId.value = "";
				currentPage.value = null;
				return;
			}
			if (!currentProjectId.value || !projects.value.some((item) => item._id === currentProjectId.value)) {
				currentProjectId.value = projects.value[0]._id;
			}
		} finally {
			loadingProjects.value = false;
		}
	};

	const loadAdminProjects = async () => {
		loadingAdminProjects.value = true;
		try {
			const response = await projectService.listAll();
			adminProjects.value = response.data ?? [];
		} finally {
			loadingAdminProjects.value = false;
		}
	};

	const loadUsers = async () => {
		loadingUsers.value = true;
		try {
			const response = await projectService.listUsers();
			availableUsers.value = response.data ?? [];
		} finally {
			loadingUsers.value = false;
		}
	};

	const loadProjectMembers = async (projectId: string) => {
		if (!projectId) {
			projectMembers.value = [];
			return;
		}
		loadingMembers.value = true;
		try {
			const response = await projectService.getMembers(projectId);
			projectMembers.value = response.data?.members ?? [];
		} finally {
			loadingMembers.value = false;
		}
	};

	const selectProject = async (projectId: string) => {
		currentProjectId.value = projectId;
		currentPageId.value = "";
		currentPage.value = null;
		pages.value = [];
		pageHistory.value = [];
		if (!projectId) return;
		loadingPages.value = true;
		try {
			const response = await pageService.list(projectId);
			pages.value = response.data ?? [];
			if (pages.value.length) {
				await selectPage(pages.value[0]._id);
			}
		} finally {
			loadingPages.value = false;
		}
	};

	const selectPage = async (pageId: string) => {
		currentPageId.value = pageId;
		if (!pageId) {
			currentPage.value = null;
			pageHistory.value = [];
			return null;
		}
		const response = await pageService.getById(pageId);
		currentPage.value = response.data
			? {
				...response.data,
				formNodeTree: normalizeFormNodeTree(response.data.formNodeTree ?? []),
			}
			: null;
		await loadPageHistory(pageId);
		return currentPage.value;
	};

	const loadPageHistory = async (pageId: string) => {
		if (!pageId) {
			pageHistory.value = [];
			return;
		}
		loadingHistory.value = true;
		try {
			const response = await pageService.getHistory(pageId);
			pageHistory.value = response.data ?? [];
		} finally {
			loadingHistory.value = false;
		}
	};

	const createPage = async (name: string) => {
		if (!currentProjectId.value) throw new Error("请先选择项目");
		mutatingPage.value = true;
		try {
			const response = await pageService.create({
				name,
				projectId: currentProjectId.value,
				formNodeTree: createEmptyFormTree(),
			});
			await selectProject(currentProjectId.value);
			if (response.data?._id) {
				await selectPage(response.data._id);
			}
			return response;
		} finally {
			mutatingPage.value = false;
		}
	};

	const updatePageMeta = async (pageId: string, payload: { name?: string; status?: "draft" | "published" }) => {
		mutatingPage.value = true;
		try {
			const response = await pageService.update(pageId, payload);
			await selectProject(currentProjectId.value);
			await selectPage(pageId);
			return response;
		} finally {
			mutatingPage.value = false;
		}
	};

	const publishPage = async (pageId: string) => {
		mutatingPage.value = true;
		try {
			const response = await pageService.publish(pageId);
			await selectProject(currentProjectId.value);
			await selectPage(pageId);
			return response;
		} finally {
			mutatingPage.value = false;
		}
	};

	const deletePage = async (pageId: string) => {
		mutatingPage.value = true;
		try {
			await pageService.remove(pageId);
			await selectProject(currentProjectId.value);
		} finally {
			mutatingPage.value = false;
		}
	};

	const duplicatePage = async (pageId: string) => {
		mutatingPage.value = true;
		try {
			const response = await pageService.duplicate(pageId);
			await selectProject(currentProjectId.value);
			if (response.data?._id) {
				await selectPage(response.data._id);
			}
			return response;
		} finally {
			mutatingPage.value = false;
		}
	};

	const restorePageVersion = async (pageId: string, version: number | string) => {
		const response = await pageService.restoreVersion(pageId, version);
		currentPage.value = response.data
			? {
				...response.data,
				formNodeTree: normalizeFormNodeTree(response.data.formNodeTree ?? []),
			}
			: null;
		await loadPageHistory(pageId);
		await selectProject(currentProjectId.value);
		await selectPage(pageId);
		return response;
	};

	const savePage = async (formNodeTree: FormNode[], changeDescription?: string) => {
		if (!currentPageId.value) throw new Error("当前没有可保存的页面");
		savingPage.value = true;
		try {
			const normalizedTree = normalizeFormNodeTree(formNodeTree);
			const response = await pageService.update(currentPageId.value, {
				name: currentPage.value?.name,
				formNodeTree: normalizedTree,
				changeDescription,
			});
			currentPage.value = response.data
				? {
					...response.data,
					formNodeTree: normalizeFormNodeTree(response.data.formNodeTree ?? []),
				}
				: null;
			lastSavedAt.value = new Date().toISOString();
			await loadPageHistory(currentPageId.value);
			await selectProject(currentProjectId.value);
			await selectPage(currentPageId.value);
			return response;
		} finally {
			savingPage.value = false;
		}
	};

	const reset = () => {
		projects.value = [];
		adminProjects.value = [];
		availableUsers.value = [];
		pages.value = [];
		pageHistory.value = [];
		projectMembers.value = [];
		currentProjectId.value = "";
		currentPageId.value = "";
		currentPage.value = null;
		lastSavedAt.value = "";
	};

	return {
		projects,
		adminProjects,
		availableUsers,
		pages,
		pageHistory,
		projectMembers,
		currentProjectId,
		currentPageId,
		currentPage,
		loadingProjects,
		loadingAdminProjects,
		loadingUsers,
		loadingPages,
		loadingHistory,
		loadingMembers,
		savingPage,
		mutatingPage,
		lastSavedAt,
		currentProject,
		currentPageName,
		loadProjects,
		loadAdminProjects,
		loadUsers,
		loadProjectMembers,
		selectProject,
		selectPage,
		loadPageHistory,
		createPage,
		updatePageMeta,
		publishPage,
		deletePage,
		duplicatePage,
		restorePageVersion,
		savePage,
		reset,
	};
});
