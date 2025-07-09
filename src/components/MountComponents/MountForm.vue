<template>
	<el-form v-bind="props" :style="style">
		<template v-for="formNode in childrens" :key="formNode.id">
			<DragWrapper :formNode="formNode" isAnimation>
				<component
					:is="renderNode(formNode)"
					:configs="formNode.configs"
					:id="formNode.id"
					:childrens="formNode.childrens"
				></component>
			</DragWrapper>
		</template>
	</el-form>
</template>

<script setup lang="tsx">
import DragWrapper from "@/components/CommonComponents/DragWrapper.vue";
import type { FormNodeCmpType } from "@/types/index";
import { computed, h, watch, type VNode } from "vue";

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
	type: "form",
	nodeName: "子表单",
	nodeType: ["NESTED"],

	// 自定义属性面板结构与节点接收的所有可配置内容
	configPanelList: {
		props: [],
		validate: [],
		style: [
			{
				prop: "width",
				defaultValue: "600px",
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
				prop: "margin",
				defaultValue: "10px",
				type: "input",
				label: "外边距",
			},
			{
				prop: "padding",
				defaultValue: "20px",
				type: "input",
				label: "内边距",
			},
		],
	},
});
const { configs, childrens } = defineProps<{
	configs: Record<string, any>;
	childrens: FormNodeCmpType[];
}>();

const props = computed(() => {
	return configs.props;
});
const validate = computed(() => {
	return configs.validate;
});
const style = computed(() => {
	return configs.style;
});
</script>
<style scoped></style>
