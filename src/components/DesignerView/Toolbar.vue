<template>
	<div id="toolbar" class="w-full h-10 p-3 flex justify-between items-center">
		<div class="toolbar-left">
			<el-tooltip effect="light" content="撤销" placement="bottom">
				<el-button :icon="Back" @click="handleUndoClick" :disabled="!canUndo"></el-button>
			</el-tooltip>
			<el-tooltip effect="light" content="重做" placement="bottom">
				<el-button :icon="Right" @click="handleRedoClick" :disabled="!canRedo"></el-button>
			</el-tooltip>
		</div>
		<div class="toolbar-right">
			<el-input v-model="changeDescription" size="small" placeholder="填写本次保存说明（可选）" clearable />
			<el-button type="primary" :loading="workspaceStore.savingPage" :disabled="!workspaceStore.currentPageId || !hasPersistedChange" @click="handleSaveClick">
				保存页面
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Back, Right } from "@element-plus/icons-vue";
import { useCommandManager } from "@/stores/commandManager";
import { useFormNodeTreeStore } from "@/stores/formNodeTree";
import { useWorkspaceStore } from "@/stores/workspace";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";

const commandManagerStore = useCommandManager();
const workspaceStore = useWorkspaceStore();
const formNodeTreeStore = useFormNodeTreeStore();
const { commandManager } = storeToRefs(commandManagerStore);
const { formNodeTree, hasPersistedChange } = storeToRefs(formNodeTreeStore);
const changeDescription = ref("");

const canUndo = computed(() => commandManager.value.canUndo());
const canRedo = computed(() => commandManager.value.canRedo());

const handleUndoClick = () => {
	commandManager.value.undo();
};
const handleRedoClick = () => {
	commandManager.value.redo();
};

const handleSaveClick = async () => {
	try {
		await workspaceStore.savePage(formNodeTree.value, changeDescription.value || undefined);
		ElMessage.success("页面保存成功");
		changeDescription.value = "";
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "页面保存失败");
	}
};
</script>

<style lang="scss" scoped>
#toolbar {
	background-color: var(--color-bg-tertiary);
	border-bottom: 1px solid var(--color-border-base);
}

.toolbar-left,
.toolbar-right {
	display: flex;
	align-items: center;
	gap: 10px;
}

.toolbar-right :deep(.el-input) {
	width: 260px;
}
</style>
