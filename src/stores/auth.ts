import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { authService } from "@/services/auth";
import { tokenStorage } from "@/services/auth-storage";
import type { AuthUser, LoginRequest, RegisterRequest } from "@/types";

export const useAuthStore = defineStore("auth", () => {
	const user = ref<AuthUser | null>(null);
	const token = ref(tokenStorage.getToken());
	const loading = ref(false);
	const initialized = ref(false);

	const isAuthenticated = computed(() => Boolean(token.value && user.value));

	const setAuth = (nextUser: AuthUser | null, nextToken?: string) => {
		user.value = nextUser;
		if (typeof nextToken === "string") {
			token.value = nextToken;
		}
	};

	const clearAuth = () => {
		user.value = null;
		token.value = "";
		tokenStorage.clearToken();
	};

	const login = async (payload: LoginRequest) => {
		loading.value = true;
		try {
			const response = await authService.login(payload);
			setAuth(response.data?.user ?? null, response.data?.token ?? tokenStorage.getToken());
			return response;
		} finally {
			loading.value = false;
		}
	};

	const register = async (payload: RegisterRequest) => {
		loading.value = true;
		try {
			const response = await authService.register(payload);
			setAuth(response.data?.user ?? null, response.data?.token ?? tokenStorage.getToken());
			return response;
		} finally {
			loading.value = false;
		}
	};

	const fetchCurrentUser = async () => {
		if (!tokenStorage.getToken()) {
			initialized.value = true;
			return null;
		}
		loading.value = true;
		try {
			const response = await authService.getCurrentUser();
			setAuth(response.data ?? null, tokenStorage.getToken());
			return response.data ?? null;
		} catch {
			clearAuth();
			return null;
		} finally {
			loading.value = false;
			initialized.value = true;
		}
	};

	const logout = async () => {
		loading.value = true;
		try {
			await authService.logout();
		} finally {
			clearAuth();
			loading.value = false;
		}
	};

	return {
		user,
		token,
		loading,
		initialized,
		isAuthenticated,
		login,
		register,
		logout,
		fetchCurrentUser,
		clearAuth,
	};
});
