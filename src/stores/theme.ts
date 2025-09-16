import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
	state: () => ({
		theme: "light",
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
		initTheme() {
			const savedTheme = localStorage.getItem("theme");
			if (savedTheme) this.theme = savedTheme;
		},
	},
});
