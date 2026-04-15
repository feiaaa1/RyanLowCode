import type { FormNode } from "@/types";

const formPropsConfig = [
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
] as const;

const formStyleConfig = [
	{
		prop: "width",
		defaultValue: "100%",
		type: "input",
		label: "宽度",
	},
	{
		prop: "minHeight",
		defaultValue: "660px",
		type: "input",
		label: "最小高度",
	},
	{
		prop: "padding",
		defaultValue: "20px",
		type: "input",
		label: "内边距",
	},
] as const;

const buildDefaultProps = () =>
	Object.fromEntries(formPropsConfig.map((item) => [item.prop, item.defaultValue]));

const buildDefaultStyle = () =>
	Object.fromEntries(formStyleConfig.map((item) => [item.prop, item.defaultValue]));

export const createRootFormNode = (): FormNode => ({
	id: crypto.randomUUID(),
	type: "form",
	nodeType: ["NESTED", "NODRAG", "ROOT"],
	name: "表单",
	configs: {
		props: buildDefaultProps(),
		style: buildDefaultStyle(),
	},
	configPanelList: {
		props: [...formPropsConfig],
		validate: [],
		style: [...formStyleConfig],
	},
	childrens: [],
});

export const normalizeFormNodeTree = (nodes: FormNode[]): FormNode[] => {
	const normalizeNode = (node: FormNode): FormNode => {
		const normalized: FormNode = {
			...node,
			configs: {
				...(node.configs ?? {}),
				props: { ...(node.configs?.props ?? {}) },
				style: { ...(node.configs?.style ?? {}) },
			},
			configPanelList: {
				...(node.configPanelList ?? {}),
			},
			childrens: node.childrens?.map(normalizeNode) ?? [],
		};

		if (node.type === "form") {
			normalized.configPanelList.props = [...formPropsConfig];
			normalized.configPanelList.validate = normalized.configPanelList.validate ?? [];
			normalized.configPanelList.style = [...formStyleConfig];
			normalized.configs.props = {
				...buildDefaultProps(),
				...normalized.configs.props,
			};
			normalized.configs.style = {
				...buildDefaultStyle(),
				...normalized.configs.style,
			};
		}

		return normalized;
	};

	if (!nodes.length) {
		return [createRootFormNode()];
	}

	return nodes.map(normalizeNode);
};
