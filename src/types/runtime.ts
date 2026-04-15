import type { FormNode } from "./global";
import type { PageStatus, Project } from "./api";

export interface RuntimePagePayload {
	_id: string;
	name: string;
	status: PageStatus;
	version: number;
	projectId: string | Pick<Project, "_id" | "name" | "owner" | "members" | "isPublic">;
	formNodeTree: FormNode[];
}

export interface RuntimeSubmissionPayload {
	_id: string;
	pageId: string;
	payload: Record<string, unknown>;
	createdAt: string;
	message?: string;
	proxyResponse?: unknown;
	resetAfterSubmit?: boolean;
	successAction?: "none" | "redirect";
	redirectUrl?: string;
}

export interface RuntimeSubmissionRecord {
	_id: string;
	pageId: {
		_id: string;
		name: string;
	};
	projectId: string;
	payload: Record<string, unknown>;
	status: "success" | "failed";
	message?: string;
	createdAt: string;
}
