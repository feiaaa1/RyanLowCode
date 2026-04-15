import { http } from "./http";
import { tokenStorage } from "./auth-storage";
import type {
	AuthPayload,
	AuthUser,
	LoginRequest,
	RefreshTokenRequest,
	RegisterRequest,
} from "@/types/api";

export const authService = {
	async register(payload: RegisterRequest) {
		const response = await http<AuthPayload>("/api/auth/register", {
			method: "POST",
			requireAuth: false,
			body: payload,
		});

		if (response.data?.token) tokenStorage.setToken(response.data.token);
		return response;
	},

	async login(payload: LoginRequest) {
		const response = await http<AuthPayload>("/api/auth/login", {
			method: "POST",
			requireAuth: false,
			body: payload,
		});

		if (response.data?.token) tokenStorage.setToken(response.data.token);
		return response;
	},

	async logout() {
		try {
			return await http<null>("/api/auth/logout", {
				method: "POST",
			});
		} finally {
			tokenStorage.clearToken();
		}
	},

	async refreshToken(payload: RefreshTokenRequest) {
		const response = await http<{ token: string }>("/api/auth/refresh", {
			method: "POST",
			requireAuth: false,
			body: payload,
		});

		if (response.data?.token) tokenStorage.setToken(response.data.token);
		return response;
	},

	getCurrentUser() {
		return http<AuthUser>("/api/auth/me", {
			method: "GET",
		});
	},
};
