<template>
	<div id="outlineTree-panel" class="shrink h-full w-full p-4">
		<el-tree :data="data" class="w-full"></el-tree>
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
#outlineTree-panel {
	background-color: var(--color-bg-tertiary);
	border-right: 1px solid var(--color-border-base);
	grid-template-rows: repeat(auto-fill, 50px);
	place-items: center center;
}
</style>
