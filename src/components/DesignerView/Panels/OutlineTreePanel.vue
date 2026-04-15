<template>
	<div id="outlineTree-panel" class="outline-tree-panel">
		<header class="outline-tree-panel__header">
			<p class="outline-tree-panel__eyebrow">Outline</p>
			<h3>页面大纲树</h3>
		</header>
		<div class="outline-tree-panel__body">
			<el-tree :data="data" class="outline-tree-panel__tree w-full" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { useFormNodeTreeStore } from "@/stores/formNodeTree";
import { storeToRefs } from "pinia";
import { computed } from "vue";
const formNodeTreeStore = useFormNodeTreeStore();
const { formNodeTree } = storeToRefs(formNodeTreeStore);

const data = computed(() => {
	return JSON.parse(
		JSON.stringify(formNodeTree.value)
			.replace(/name/g, "label")
			.replace(/childrens/g, "children")
	);
});
</script>

<style lang="scss" scoped>
.outline-tree-panel {
	height: 100%;
	width: 100%;
	padding: 24px;
	background-color: var(--color-bg-tertiary);
	border-right: 1px solid var(--color-border-base);
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.outline-tree-panel__header h3 {
	font-size: 24px;
	font-weight: 700;
	color: var(--color-text-primary);
	margin-top: 8px;
}

.outline-tree-panel__eyebrow {
	font-size: 12px;
	letter-spacing: 0.2em;
	text-transform: uppercase;
	color: var(--color-text-tertiary);
}

.outline-tree-panel__body {
	flex: 1;
	overflow: auto;
	padding: 12px;
	border-radius: 20px;
	background: color-mix(in srgb, var(--color-bg-overlay) 86%, transparent);
}

:deep(.el-tree) {
	background: transparent;
	font-size: 16px;
	color: var(--color-text-primary);
}

:deep(.el-tree-node__content) {
	height: 42px;
	border-radius: 12px;
	padding-right: 8px;
}
</style>
