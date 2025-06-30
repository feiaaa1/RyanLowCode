<template>
	<el-form v-bind="props">
		<component
			v-for="item in children"
			:key="item.id"
			:is="item.type"
			:options="item.options"
		></component>
	</el-form>
</template>

<script lang="ts">
import type { FormNode, ConfigPanelList } from "@/types/index";
export default {
	type: "form",
	nodeName: "子表单",
	nodeType: "NESTED",
	props: {
		configs: {
			type: Object,
			default: () => ({}),
		},
		children: {
			type: Array,
			default: () => [],
		},
	},
	computed: {
		props() {
			return this.configs.props;
		},
		validate() {
			return this.configs.validate;
		},
		style() {
			return this.configs.style;
		},
	},

	// 自定义属性面板结构与节点接收的所有可配置内容
	configPanelList: {
		props: [
			// {
			// 	title: "表单属性",
			// 	items: [
			// 		{
			// 			prop: "labelWidth",
			// 			defaultValue: "auto",
			// 			label: "标签宽度",
			// 			type: "input",
			// 		},
			// 	],
			// },
		],
		validate: [{}],
		style: [{}],
	},
};
</script>
<style scoped></style>
