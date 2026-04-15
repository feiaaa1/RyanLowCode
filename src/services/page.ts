import { http } from "./http";
import type {
	CreatePageRequest,
	Page,
	PageHistoryItem,
	PageListItem,
	UpdatePageRequest,
} from "@/types/api";

export const pageService = {
	create(payload: CreatePageRequest) {
		return http<Page>("/api/pages", {
			method: "POST",
			body: payload,
		});
	},

	list(projectId: string) {
		return http<PageListItem[]>(`/api/pages?projectId=${encodeURIComponent(projectId)}`, {
			method: "GET",
		});
	},

	getById(id: string) {
		return http<Page>(`/api/pages/${id}`, {
			method: "GET",
		});
	},

	update(id: string, payload: UpdatePageRequest) {
		return http<Page>(`/api/pages/${id}`, {
			method: "PUT",
			body: payload,
		});
	},

	remove(id: string) {
		return http<null>(`/api/pages/${id}`, {
			method: "DELETE",
		});
	},

	publish(id: string) {
		return http<Page>(`/api/pages/${id}/publish`, {
			method: "POST",
		});
	},

	getHistory(id: string) {
		return http<PageHistoryItem[]>(`/api/pages/${id}/history`, {
			method: "GET",
		});
	},

	restoreVersion(id: string, version: number | string) {
		return http<Page>(`/api/pages/${id}/restore/${version}`, {
			method: "POST",
		});
	},

	duplicate(id: string) {
		return http<Page>(`/api/pages/${id}/duplicate`, {
			method: "POST",
		});
	},
};
