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
import { computed, h, type VNode } from "vue";

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
	configPanelList: {
		props: [
			{
				prop: "submit_mode",
				defaultValue: "internal",
				type: "select",
				label: "提交模式",
				options: [
					{ label: "仅保存到平台", value: "internal" },
					{ label: "转发到指定地址", value: "proxy" },
				],
			},
			{
				prop: "submit_endpoint",
				defaultValue: "",
				type: "input",
				label: "提交地址",
				placeholder: "例如：https://example.com/api/form",
			},
			{
				prop: "submit_method",
				defaultValue: "POST",
				type: "select",
				label: "提交方法",
				options: [
					{ label: "POST", value: "POST" },
					{ label: "PUT", value: "PUT" },
				],
			},
			{
				prop: "submit_successMessage",
				defaultValue: "表单提交成功",
				type: "input",
				label: "成功提示",
			},
			{
				prop: "submit_resetAfterSubmit",
				defaultValue: true,
				type: "switch",
				label: "提交成功后清空",
			},
			{
				prop: "submit_successAction",
				defaultValue: "none",
				type: "select",
				label: "成功后动作",
				options: [
					{ label: "不处理", value: "none" },
					{ label: "跳转到链接", value: "redirect" },
				],
			},
			{
				prop: "submit_redirectUrl",
				defaultValue: "",
				type: "input",
				label: "跳转地址",
				placeholder: "例如：https://www.baidu.com",
			},
		],
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
const style = computed(() => {
	return configs.style;
});
</script>
<style scoped></style>
