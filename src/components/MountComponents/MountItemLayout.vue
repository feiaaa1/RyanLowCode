<template>
	<div class="relative" :style="style">
		<!--悬浮样式 -->
		<!-- <div
			class="absolute -inset-0.5 border-2 border-dashed hover:border-blue-600 border-transparent z-10 bg-transparent"
		>
			<div
				id="drag-wrapper-model"
				class="absolute inset-0 z-10 hover:bg-blue-600 bg-transparent opacity-15"
			></div>
		</div> -->
		<div
			class="bg-gray-200 h-full w-full flex items-center justify-center"
			v-if="!(childrens?.length > 0) && !isPreview"
		>
			请拖拽组件到此处
		</div>
		<div class="relative z-11" v-else>
			<template v-for="formNode in childrens" :key="formNode.id">
				<DragWrapper :formNode="formNode" isAnimation>
					<component
						:is="renderNode(formNode)"
						:configs="formNode.configs"
						:childrens="formNode.childrens"
						:id="formNode.id"
					/>
				</DragWrapper>
			</template>
		</div>
	</div>
</template>
<script setup lang="tsx">
import { computed } from "vue";
import type { FormNodeCmpType } from "@/types/index";
import { type VNode, h } from "vue";
import DragWrapper from "@/components/CommonComponents/DragWrapper.vue";
const { configs, childrens } = defineProps<{
	configs: Record<string, any>;
	childrens: FormNodeCmpType[];
}>();

// 预览状态
import { usePreviewStore } from "@/stores/preview";
import { storeToRefs } from "pinia";
const previewStore = usePreviewStore();
const { isPreview } = storeToRefs(previewStore);

const renderNode = (formNode: FormNodeCmpType): VNode => {
	if (formNode.nodeType === "NESTED") {
		return h(formNode.type, {
			configs: formNode.configs,
			childrens: formNode.childrens,
		});
	}
	return h(formNode.type, { configs: formNode.configs });
};

defineOptions({
	type: "layoutItem",
	nodeName: "布局",
	nodeType: ["NESTED", "NODRAG"],

	// 自定义属性面板结构与节点接收的所有可配置内容
	configPanelList: {
		props: [],

		validate: [{}],

		style: [
			{
				prop: "width",
				defaultValue: "160px",
				type: "input",
				label: "宽度",
			},
			{
				prop: "height",
				defaultValue: "260px",
				type: "input",
				label: "高度",
			},
			{
				prop: "display",
				defaultValue: "flex",
				type: "select",
				label: "布局方式",
				options: [
					{
						label: "flex",
						value: "flex",
					},
					{
						label: "grid",
						value: "grid",
					},
				],
			},
			{
				prop: "flex-direction",
				defaultValue: "column",
				type: "select",
				label: "主轴方向",
				options: [
					{
						label: "row",
						value: "row",
					},
					{
						label: "row-reverse",
						value: "row-reverse",
					},
					{
						label: "column",
						value: "column",
					},
					{
						label: "column-reverse",
						value: "column-reverse",
					},
				],
			},
			{
				prop: "justify-content",
				defaultValue: "flex-start",
				type: "select",
				label: "水平对齐",
				options: [
					{
						label: "flex-start",
						value: "flex-start",
					},
					{
						label: "flex-end",
						value: "flex-end",
					},
					{
						label: "center",
						value: "center",
					},
					{
						label: "space-between",
						value: "space-between",
					},
					{
						label: "space-around",
						value: "space-around",
					},
					{
						label: "space-evenly",
						value: "space-evenly",
					},
				],
			},
			{
				prop: "align-items",
				defaultValue: "flex-start",
				type: "select",
				label: "垂直对齐",
				options: [
					{
						label: "flex-start",
						value: "flex-start",
					},
					{
						label: "flex-end",
						value: "flex-end",
					},
					{
						label: "center",
						value: "center",
					},
					{
						label: "baseline",
						value: "baseline",
					},
					{
						label: "stretch",
						value: "stretch",
					},
				],
			},
			{
				prop: "margin",
				defaultValue: "0",
				type: "input",
				label: "外边距",
			},
		],
	},
});
const style = computed(() => {
	return configs.style;
});
</script>
<style scoped></style>
