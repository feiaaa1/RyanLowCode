import { defineStore } from "pinia";
import { ref } from "vue";
import type { FormNode, FormNodeCmpType } from "@/types/index";

// 属性面板状态管理
export const usePropertyPanelStore = defineStore("propertyPanel", () => {
	// 记录当前选中节点
	const currentFormNode = ref<FormNode | FormNodeCmpType | null>(null);
	// 是否显示属性面板
	// const isShow = ref(false);

	const changeCurrentFormNode = (node: FormNode | FormNodeCmpType | null) => {
		currentFormNode.value = node;
	};
	return {
		currentFormNode,
		changeCurrentFormNode,
	};
});
