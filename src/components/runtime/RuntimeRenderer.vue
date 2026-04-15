<template>
	<div class="runtime-renderer">
		<template v-for="node in nodes" :key="node.id">
			<RuntimeNode :node="node" v-model="model" />
		</template>
	</div>
</template>

<script setup lang="ts">
import RuntimeNode from "./RuntimeNode.vue";
import type { FormNode } from "@/types";

const model = defineModel<Record<string, unknown>>({ required: true });

defineProps<{
	nodes: FormNode[];
}>();
</script>

<style scoped>
.runtime-renderer {
	display: flex;
	flex-direction: column;
	gap: 18px;
}
</style>
