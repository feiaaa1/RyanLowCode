<template>
	<el-form-item :label="props?._label" :prop="props?._field" :style="itemStyle">
		<el-date-picker :value="modelValue" type="date" v-bind="props" :style="style"></el-date-picker>
	</el-form-item>
</template>

<script lang="ts">
export default {
	type: "datePicker",
	nodeName: "日期选择器",
	nodeType: "ORDINARY",
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
				defaultValue: "日期选择器",
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
				defaultValue: "请输入内容",
				label: "占位符",
				type: "input",
			},
			{
				prop: "disabled",
				defaultValue: false,
				label: "禁用",
				type: "checkbox",
			},
			{
				prop: "format",
				defaultValue: "YYYY-MM-DD",
				label: "格式",
				type: "input",
			},
			{
				prop: "type",
				defaultValue: "date",
				label: "类型",
				type: "options",
				options: ["week", "year", "date"],
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
				type: "options",
				options: [],
			},
			{
				prop: "item-flex",
				defaultValue: "1",
				label: "弹性布局",
				type: "input",
			},
			{
				prop: "item-alignItems",
				defaultValue: "center",
				label: "垂直对齐方式",
				type: "options",
				options: ["flex-start", "flex-end", "center", "baseline", "stretch"],
			},
			{
				prop: "item-justifyContent",
				defaultValue: "flex-start",
				label: "水平对齐方式",
				type: "options",
				options: [
					"flex-start",
					"flex-end",
					"center",
					"space-between",
					"space-around",
					"space-evenly",
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
