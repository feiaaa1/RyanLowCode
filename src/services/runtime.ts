import { http } from "./http";
import type { RuntimePagePayload, RuntimeSubmissionPayload, RuntimeSubmissionRecord } from "@/types";

export const runtimeService = {
	getPage(id: string) {
		return http<RuntimePagePayload>(`/api/runtime/pages/${id}`, {
			method: "GET",
			requireAuth: false,
		});
	},

	submitPage(id: string, payload: Record<string, unknown>) {
		return http<RuntimeSubmissionPayload>(`/api/runtime/pages/${id}/submit`, {
			method: "POST",
			body: payload,
			requireAuth: false,
		});
	},

	listSubmissions(projectId: string, filters: { status?: string; pageId?: string } = {}) {
		const params = new URLSearchParams();
		if (filters.status) params.set("status", filters.status);
		if (filters.pageId) params.set("pageId", filters.pageId);
		const suffix = params.toString() ? `?${params.toString()}` : "";
		return http<RuntimeSubmissionRecord[]>(`/api/runtime/projects/${projectId}/submissions${suffix}`, {
			method: "GET",
		});
	},
};
