<template>
	<div id="top-toolbar" class="flex items-center justify-end p-2 w-full h-full">
		<RyButton
			@click="handlePreviewClick"
			:style="{ padding: '4px 20px' }"
			text="预览"
		/>
		<RyButton
			:style="{ padding: '4px 20px' }"
			text="导出"
			@click="handleExportClick"
		/>
		<el-dialog title="title" width="600px" v-model="visible" @close="onClose">
			{{ formNodeTree }}
		</el-dialog>
	</div>
	<Preview :drawer="drawer" @close="() => (drawer = false)" />
</template>

<script setup lang="ts">
import Preview from "@/components/DesignerView/Preview.vue";
import { useFormNodeTreeStore } from "@/stores/formNodeTree";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const { formNodeTree } = storeToRefs(useFormNodeTreeStore());

const drawer = ref(false);
const handlePreviewClick = () => {
	drawer.value = true;
};

const visible = ref(false);
const onClose = () => {
	visible.value = false;
};
const handleExportClick = () => {
	visible.value = true;
};
</script>

<style lang="scss" scoped>
#top-toolbar {
	background-color: var(--color-bg-tertiary);
	border: 1px solid var(--color-border-dark);
	padding: 4px;
}
</style>
