import type { FormNode } from "./global";

export type UserRole = "admin" | "user";
export type ProjectMemberRole = "owner" | "editor" | "viewer";
export type PageStatus = "draft" | "published";
export type DataSourceType = "api" | "database" | "static";

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

export interface AuthUser {
	id: string;
	email: string;
	username: string;
	role: UserRole;
	avatar?: string;
	createdAt: string;
	updatedAt?: string;
}

export interface AuthPayload {
	user: AuthUser;
	token: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest extends LoginRequest {
	username: string;
}

export interface RefreshTokenRequest {
	token: string;
}

export interface ProjectMemberUser {
	_id: string;
	username: string;
	email: string;
	avatar?: string;
	role?: UserRole;
}

export interface ProjectMember {
	userId: string | ProjectMemberUser;
	role: ProjectMemberRole;
}

export interface ProjectOwner {
	_id?: string;
	id?: string;
	username: string;
	email: string;
	avatar?: string;
	role?: UserRole;
}

export interface Project {
	_id: string;
	name: string;
	description?: string;
	owner: string | ProjectOwner;
	members: ProjectMember[];
	thumbnail?: string;
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateProjectRequest {
	name: string;
	description?: string;
	isPublic?: boolean;
}

export interface UpdateProjectRequest {
	name?: string;
	description?: string;
	isPublic?: boolean;
}

export interface AddProjectMemberRequest {
	userId: string;
	role: ProjectMemberRole;
}

export interface UpdateProjectMemberRequest {
	role: Exclude<ProjectMemberRole, "owner">;
}

export interface ProjectMembersPayload {
	owner: ProjectOwner | string;
	members: ProjectMember[];
}

export interface ProjectUser {
	_id: string;
	username: string;
	email: string;
	avatar?: string;
	role: UserRole;
	createdAt: string;
}

export interface Page {
	_id: string;
	name: string;
	projectId: string | Pick<Project, "_id" | "name" | "owner" | "members" | "isPublic">;
	formNodeTree: FormNode[];
	thumbnail?: string;
	version: number;
	status: PageStatus;
	createdBy: string;
	updatedBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface PageListItem extends Omit<Page, "formNodeTree"> {
	formNodeTree?: never;
}

export interface CreatePageRequest {
	name: string;
	projectId: string;
	formNodeTree: FormNode[];
}

export interface UpdatePageRequest {
	name?: string;
	formNodeTree?: FormNode[];
	status?: PageStatus;
	changeDescription?: string;
}

export interface PageHistoryItem {
	_id: string;
	pageId: string;
	version: number;
	formNodeTree: FormNode[];
	changedBy: {
		username: string;
		email: string;
	};
	changeDescription?: string;
	createdAt: string;
}

export interface DataSourceConfig {
	url?: string;
	method?: string;
	headers?: Record<string, string>;
	body?: unknown;
	data?: unknown;
}

export interface DataSource {
	_id: string;
	name: string;
	projectId: string;
	type: DataSourceType;
	config: DataSourceConfig;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}
