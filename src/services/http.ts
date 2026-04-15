import type { ApiResponse } from "@/types/api";
import { tokenStorage } from "./auth-storage";

export class ApiError extends Error {
	status: number;
	response?: unknown;

	constructor(message: string, status: number, response?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.response = response;
	}
}

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
	"http://localhost:3000";

interface RequestOptions extends Omit<RequestInit, "body"> {
	requireAuth?: boolean;
	body?: unknown;
}

export async function http<T>(
	path: string,
	options: RequestOptions = {}
): Promise<ApiResponse<T>> {
	const { headers, requireAuth = true, body, ...rest } = options;
	const requestHeaders = new Headers(headers);

	if (body !== undefined && body !== null && !(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
		requestHeaders.set("Content-Type", "application/json");
	}

	if (requireAuth) {
		const token = tokenStorage.getToken();
		if (token) {
			requestHeaders.set("Authorization", `Bearer ${token}`);
		}
	}

	const response = await fetch(`${API_BASE_URL}${path}`, {
		...rest,
		headers: requestHeaders,
		body:
			typeof body === "string" ||
			body === undefined ||
			body === null ||
			body instanceof FormData ||
			body instanceof URLSearchParams ||
			body instanceof Blob ||
			body instanceof ArrayBuffer
				? (body as BodyInit | null | undefined)
				: JSON.stringify(body),
	});

	const text = await response.text();
	const payload = text ? (JSON.parse(text) as ApiResponse<T>) : undefined;

	if (!response.ok) {
		throw new ApiError(
			payload?.message || payload?.error || "Request failed",
			response.status,
			payload
		);
	}

	return payload ?? { success: true };
}
