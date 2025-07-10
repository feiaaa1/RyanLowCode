<template>
	<div id="toolbar" class="w-full h-10 p-3 flex justify-end items-center">
		<el-tooltip effect="dark" content="撤销" placement="bottom">
			<el-button
				:icon="Back"
				@click="handleUndoClick"
				:disabled="!canUndo"
			></el-button>
		</el-tooltip>
		<el-tooltip effect="dark" content="重做" placement="bottom">
			<el-button
				:icon="Right"
				@click="handleRedoClick"
				:disabled="!canRedo"
			></el-button>
		</el-tooltip>
	</div>
</template>

<script setup lang="ts">
import { Back, Right } from "@element-plus/icons-vue";
import { useCommandManager } from "@/stores/commandManager";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const commandManagerStore = useCommandManager();
const { commandManager } = storeToRefs(commandManagerStore);
const canUndo = computed(() => {
	return commandManager.value.canUndo();
});
const canRedo = computed(() => {
	return commandManager.value.canRedo();
});
const handleUndoClick = () => {
	commandManager.value.undo();
};
const handleRedoClick = () => {
	commandManager.value.redo();
};
</script>

<style lang="scss" scoped>
#toolbar {
	background-color: var(--color-bg-tertiary);
	border-bottom: 1px solid var(--color-border-base);
}
</style>
