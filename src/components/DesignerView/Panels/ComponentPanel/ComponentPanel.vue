<template>
	<div id="component-panel" class="shrink h-full w-full grid grid-cols-2 p-4">
		<template v-for="formNode in formNodeList" :key="formNode.name">
			<FormNodeCmp :form-node="formNode" />
		</template>
	</div>
</template>

<script setup lang="ts">
defineOptions({
	name: "ComponentPanel",
});
import FormNodeCmp from "./child/DragFormNode.vue";
import { useComponentRegisterStore } from "@/stores/componentRegister";
import { ref, unref } from "vue";
import type {
	FormNodeTemplate,
	FormComponent,
	ConfigPanelItem,
} from "@/types/index";

const componentRegisterStore = useComponentRegisterStore();
// console.log(componentRegisterStore.componentTypeMap);

// 核心状态：表单节点模板列表
const formNodeList = ref<FormNodeTemplate[]>([]);

// 核心功能：根据组件对象生成表单节点模板列表
Object.values(componentRegisterStore.componentTypeMap).forEach(
	(component: FormComponent) => {
		const configs = ref<Record<string, Record<string, any>>>({});
		// {
		// 	prop: {},
		// 	validate: {},
		// 	style: {},
		// };

		for (const key in component.configPanelList) {
			configs.value[key] = {};
			// 获取组件第一层配置项 prop、validate、style，值为configPanelItem数组
			component.configPanelList[key].forEach(
				(configPanelItem: ConfigPanelItem) => {
					//遍历该数组，并解构出每个configPanelItem的prop，并赋值为defaultValue
					const { prop, defaultValue } = configPanelItem;
					unref(configs)[key][prop] = defaultValue;
				}
			);
		}
		const formNode: FormNodeTemplate = {
			name: component.nodeName,
			type: component.type,
			configs: unref(configs),
			configPanelList: component.configPanelList,
			nodeType: component.nodeType,
		}
		if (component.nodeType.includes('NESTED')) formNode.childrens = []
		// 配置完configs后推入formNodeList
		formNodeList.value?.push(formNode);
	}
);

// console.log(formNodeList.value, "nodeList.value");
</script>

<style lang="scss" scoped>
#component-panel {
	background-color: var(--color-bg-tertiary);
	border-right: 1px solid var(--color-border-base);
	grid-template-rows: repeat(auto-fill, 50px);
	place-items: center center;
}
</style>
