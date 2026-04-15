<template>
	<div id="component-panel" class="component-panel">
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
const formNodeList = ref<FormNodeTemplate[]>([]);

Object.values(componentRegisterStore.componentTypeMap).forEach(
	(component: FormComponent) => {
		const configs = ref<Record<string, Record<string, any>>>({});

		for (const key in component.configPanelList) {
			configs.value[key] = {};
			component.configPanelList[key].forEach(
				(configPanelItem: ConfigPanelItem) => {
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
		};
		if (component.nodeType.includes("NESTED")) formNode.childrens = [];
		formNodeList.value?.push(formNode);
	}
);
</script>

<style lang="scss" scoped>
.component-panel {
	height: 100%;
	width: 100%;
	display: grid;
	grid-template-columns: repeat(2, minmax(150px, 1fr));
	auto-rows: minmax(96px, auto);
	gap: 18px;
	padding: 24px;
	align-content: start;
	background-color: var(--color-bg-tertiary);
	border-right: 1px solid var(--color-border-base);
	overflow-y: auto;
}
</style>
