<template>
	<div :data-theme="themeStore.theme" class="app-shell">
		<DndProvider :backend="HTML5Backend">
			<router-view />
		</DndProvider>
	</div>
</template>

<script setup lang="ts">
import { HTML5Backend } from "react-dnd-html5-backend";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";
import { onMounted } from "vue";

const themeStore = useThemeStore();
const authStore = useAuthStore();

themeStore.initTheme();

onMounted(async () => {
	if (!authStore.initialized) {
		await authStore.fetchCurrentUser();
	}
});
</script>

<style scoped>
.app-shell {
	min-height: 100vh;
}
</style>
