<template>
	<el-form-item
		:label="props?.item_label"
		:prop="props?.item_field"
		:label-width="props?.item_labelWidth"
		:label-position="props?.item_labelPosition"
		:style="itemStyle"
	>
		<el-input
			:value="modelValue"
			@input="$emit('update:modelValue', $event)"
			v-bind="props"
			:style="style"
		>
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
		// console.log(this.configs, "this.configs");
	},
	watch: {
		configs: {
			handler() {
				// console.log(newVal, "newVal");
			},
			deep: true,
		},
	},
	// 属性面板结构
	configPanelList: {
		props: [
			{
				prop: "item_field",
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
				prop: "item_label",
				defaultValue: "单行文本",
				label: "标题",
				type: "input",
			},
			{
				prop: "item_labelWidth",
				defaultValue: "auto",
				label: "标签宽度",
				type: "input",
			},
			{
				prop: "item_labelPosition",
				defaultValue: "left",
				label: "标签位置",
				type: "select",
				options: [
					{
						label: "上对齐",
						value: "top",
					},
					{
						label: "左对齐",
						value: "left",
					},
					{
						label: "右对齐",
						value: "right",
					},
				],
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
		validate: [
			{
				prop: "required",
				defaultValue: false,
				label: "必填",
				type: "switch",
			},
			{
				prop: "min",
				defaultValue: "",
				label: "最小长度",
				type: "input",
			},
			{
				prop: "max",
				defaultValue: "",
				label: "最大长度",
				type: "input",
			},
		],
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
				prop: "item-margin",
				defaultValue: "0",
			},
		],
	},
};
</script>
<style scoped></style>
