import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
	state: () => ({
		theme: "light",
		workspaceSidebarCollapsed: false,
	}),
	actions: {
		setTheme(theme: string) {
			this.theme = theme;
			localStorage.setItem("theme", theme);
		},
		toggleTheme() {
			this.theme = this.theme === "light" ? "dark" : "light";
			localStorage.setItem("theme", this.theme);
		},
		setWorkspaceSidebarCollapsed(collapsed: boolean) {
			this.workspaceSidebarCollapsed = collapsed;
			localStorage.setItem("workspaceSidebarCollapsed", String(collapsed));
		},
		toggleWorkspaceSidebar() {
			this.setWorkspaceSidebarCollapsed(!this.workspaceSidebarCollapsed);
		},
		initTheme() {
			this.theme = "light";
			localStorage.setItem("theme", this.theme);
			const savedCollapsed = localStorage.getItem("workspaceSidebarCollapsed");
			if (savedCollapsed !== null) {
				this.workspaceSidebarCollapsed = savedCollapsed === "true";
			}
		},
	},
});
