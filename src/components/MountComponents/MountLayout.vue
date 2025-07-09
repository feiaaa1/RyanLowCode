<template>
	<div id="outer-container" class="relative" :style="style">
		<template v-for="(formNode, index) in props.childrens" :key="formNode.id">
			<DragWrapper :formNode="formNode">
				<component
					:is="formNode.type"
					:id="formNode.id"
					:configs="formNode.configs"
					:childrens="formNode.childrens"
				/>
			</DragWrapper>
		</template>
	</div>
</template>

<script setup lang="tsx">
import { computed, watch, ref, unref, onMounted } from "vue";
import type { FormNodeCmpType, ConfigPanelItem, FormNode } from "@/types/index";
import DragWrapper from "@/components/CommonComponents/DragWrapper.vue";
const props = defineProps<{
	configs: Record<string, any>;
	childrens: FormNodeCmpType[];
	id: string;
}>();

import { useFormNodeTreeStore } from "@/stores/formNodeTree";
const formNodeTreeStore = useFormNodeTreeStore();
const { formNodeTree } = storeToRefs(formNodeTreeStore);
const { findNodeById, insertInto } = formNodeTreeStore;

import { useComponentRegisterStore } from "@/stores/componentRegister";
import { storeToRefs } from "pinia";
const componentRegisterStore = useComponentRegisterStore();
let layoutItemCmp = componentRegisterStore.componentTypeMap["layoutItem"];
layoutItemCmp = {
	name: layoutItemCmp.nodeName,
	type: layoutItemCmp.type,
	configPanelList: layoutItemCmp.configPanelList,
	nodeType: layoutItemCmp.nodeType,
} as any;
const configs = ref<Record<string, Record<string, any>>>({});
for (const key in layoutItemCmp.configPanelList) {
	configs.value[key] = {};
	// 获取组件第一层配置项 prop、validate、style，值为configPanelItem数组
	layoutItemCmp.configPanelList[key].forEach(
		(configPanelItem: ConfigPanelItem) => {
			//遍历该数组，并解构出每个configPanelItem的prop，并赋值为defaultValue
			const { prop, defaultValue } = configPanelItem;
			unref(configs)[key][prop] = defaultValue;
		}
	);
}
layoutItemCmp.type = "layoutItem";
layoutItemCmp.configs = unref(configs);
import { v4 as uuidv4 } from "uuid";
import { cloneDeep } from "lodash";
import { ElMessage } from "element-plus";
watch(
	() => props.configs.props.cloumn,
	(newVal, oldVal) => {
		const nodeInfo = findNodeById(props.id, formNodeTree.value);
		if (Number.isNaN(Number(newVal)) || newVal === "") return;
		if (!nodeInfo) return;
		let childrens = nodeInfo.array[nodeInfo.index].childrens;
		if (!Array.isArray(childrens)) childrens = [];
		if (newVal > childrens.length) {
			let count = 0;
			const cycleCount = Number(newVal) - childrens.length;
			while (count < cycleCount) {
				count++;
				const layoutItemCmpClone = cloneDeep(layoutItemCmp);
				layoutItemCmpClone.id = uuidv4();
				childrens.push(layoutItemCmpClone as unknown as FormNode);
				console.log(123);
				// console.log(nodeInfo.array[nodeInfo.index].childrens)
				// console.log(formNodeTree)
			}
		} else {
			let count = 0;
			const cycleCount = childrens.length - Number(newVal);
			while (count < cycleCount) {
				count++;
				childrens.pop();
				// console.log(nodeInfo.array[nodeInfo.index].childrens)
				// console.log(formNodeTree)
			}
		}
	},
	{ immediate: true }
);

defineOptions({
	type: "layout",
	nodeName: "布局容器",
	nodeType: ["NESTED", "NODROP"],

	// 自定义属性面板结构与节点接收的所有可配置内容
	configPanelList: {
		props: [
			{
				prop: "cloumn",
				defaultValue: 3,
				type: "input-number",
				label: "列数",
			},
		],

		validate: [{}],

		style: [
			{
				prop: "width",
				defaultValue: "560px",
				type: "input",
				label: "宽度",
			},
			{
				prop: "height",
				defaultValue: "300px",
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
				defaultValue: "center",
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
				prop: "gap",
				defaultValue: "10px",
				type: "input",
				label: "间距",
			},
			{
				prop: "margin",
				defaultValue: "0",
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
const _props = computed(() => {
	return props.configs.props;
});
const validate = computed(() => {
	return props.configs.validate;
});
const style = computed(() => {
	return props.configs.style;
});
</script>
<style scoped></style>
