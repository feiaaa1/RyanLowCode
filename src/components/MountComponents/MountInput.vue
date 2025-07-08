<template>
	<el-form-item :label="props?._label" :prop="props?._field" :style="itemStyle">
		<el-input :value="modelValue" @input="$emit('update:modelValue', $event)" v-bind="props" :style="style">
		</el-input>
	</el-form-item>
</template>

<script lang="ts">
export default {
	type: "input",
	nodeName: "单行输入框",
	nodeType: ["ORDINARY"],
	props: {
		modelValue: String,
		configs: {
			type: Object,
			default: () => ({}),
		},
	},
	computed: {
		itemStyle() {
			const itemStyle: Record<string, string | number | boolean> = {};
			const itemRep = /^item-/;
			for (let key in this.configs.style) {
				if (itemRep.test(key)) {
					itemStyle[key.replace(itemRep, "")] = this.configs.style[key];
					// console.log(this.configs.style[key], "this.configs.style");
					// console.log(key.replace(itemRep, ""), "key");
					// console.log(this.configs.style[key], "this.configs.style[rawKey]");
				}
			}
			// console.log(itemStyle, "itemStyle");
			return itemStyle;
		},
		style() {
			return this.configs.style;
		},
		props() {
			return this.configs.props;
		},
		validate() {
			return this.configs.validate;
		},
	},
	mounted() {
		console.log(this.configs, "this.configs");
	},
	watch: {
		configs: {
			handler(newVal) {
				console.log(newVal, "newVal");
			},
			deep: true,
		},
	},
	// 属性面板结构
	configPanelList: {
		props: [
			{
				prop: "_field",
				defaultValue: "",
				label: "字段名",
				type: "input",
				validate: {
					required: true,
					message: "请输入字段名",
					trigger: "blur",
				},
			},
			{
				prop: "_label",
				defaultValue: "单行文本",
				label: "标题",
				type: "input",
			},
			{
				prop: "_labelWidth",
				defaultValue: "auto",
				label: "标签宽度",
				type: "input",
			},
			{
				prop: "placeholder",
				defaultValue: "请输入",
				label: "占位符",
				type: "input",
			},
			{
				prop: "disabled",
				defaultValue: false,
				label: "禁用",
				type: "switch",
			},
		],
		validate: [],
		style: [
			{
				prop: "width",
				defaultValue: "200px",
				label: "宽度",
				type: "input",
			},
			{
				prop: "height",
				defaultValue: "32px",
				label: "高度",
				type: "input",
			},
			{
				prop: "item-display",
				defaultValue: "flex",
				label: "显示方式",
				type: "select",
				options: [
					{
						label: "flex",
						value: "flex",
					},
					{
						label: "block",
						value: "block",
					}
				],
			},
			{
				prop: "item-alignItems",
				defaultValue: "center",
				label: "垂直对齐方式",
				type: "select",
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

				],
			},
			{
				prop: "item-justifyContent",
				defaultValue: "flex-start",
				label: "水平对齐方式",
				type: "select",
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
					}
				],
			},
			{
				prop: "item-margin",
				defaultValue: "0",
			},
		],
	},
};
</script>
<style scoped></style>
