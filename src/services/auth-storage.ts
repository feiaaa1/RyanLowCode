const TOKEN_STORAGE_KEY = "ryan-lowcode-token";

export const tokenStorage = {
	getToken() {
		if (typeof window === "undefined") return "";
		return localStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
	},
	setToken(token: string) {
		if (typeof window === "undefined") return;
		localStorage.setItem(TOKEN_STORAGE_KEY, token);
	},
	clearToken() {
		if (typeof window === "undefined") return;
		localStorage.removeItem(TOKEN_STORAGE_KEY);
	},
};
