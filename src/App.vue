<template>
	<div :data-theme="themeStore.theme">
		<DndProvider :backend="HTML5Backend">
			<router-view></router-view>
		</DndProvider>
	</div>
</template>

<script setup lang="ts">
import { HTML5Backend } from "react-dnd-html5-backend";
import { useThemeStore } from "@/stores/theme";

const themeStore = useThemeStore();
</script>

<style scoped></style>
