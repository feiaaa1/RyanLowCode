import { http } from "./http";
import type {
	AddProjectMemberRequest,
	CreateProjectRequest,
	Project,
	ProjectMembersPayload,
	ProjectUser,
	UpdateProjectMemberRequest,
	UpdateProjectRequest,
} from "@/types/api";

export const projectService = {
	create(payload: CreateProjectRequest) {
		return http<Project>("/api/projects", {
			method: "POST",
			body: payload,
		});
	},

	list() {
		return http<Project[]>("/api/projects", {
			method: "GET",
		});
	},

	listAll() {
		return http<Project[]>("/api/projects/all", {
			method: "GET",
		});
	},

	listUsers() {
		return http<ProjectUser[]>("/api/projects/users/all", {
			method: "GET",
		});
	},

	getById(id: string) {
		return http<Project>(`/api/projects/${id}`, {
			method: "GET",
		});
	},

	getMembers(id: string) {
		return http<ProjectMembersPayload>(`/api/projects/${id}/members`, {
			method: "GET",
		});
	},

	update(id: string, payload: UpdateProjectRequest) {
		return http<Project>(`/api/projects/${id}`, {
			method: "PUT",
			body: payload,
		});
	},

	remove(id: string) {
		return http<null>(`/api/projects/${id}`, {
			method: "DELETE",
		});
	},

	addMember(id: string, payload: AddProjectMemberRequest) {
		return http<Project>(`/api/projects/${id}/members`, {
			method: "POST",
			body: payload,
		});
	},

	updateMember(id: string, userId: string, payload: UpdateProjectMemberRequest) {
		return http<Project>(`/api/projects/${id}/members/${userId}`, {
			method: "PUT",
			body: payload,
		});
	},

	removeMember(id: string, userId: string) {
		return http<null>(`/api/projects/${id}/members/${userId}`, {
			method: "DELETE",
		});
	},
};
