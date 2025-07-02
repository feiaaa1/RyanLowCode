import { defineStore } from "pinia";
import type { FormNode, FormNodeCmpType } from "@/types/index";
import { ref, watch } from "vue";
import { Flip } from "@/utils/flip";
import { AnimationManager } from "@/utils/animation";
import { nextTick } from "vue";
import { ElMessage } from "element-plus";
export const useFormNodeTreeStore = defineStore("formNodeTree", () => {
	const formNodeTree = ref<FormNode[]>([]);

	const insertBefore = (
		node: FormNode,
		target: FormNode | null | undefined
	) => {
		// console.log(node, "node");
		// console.log(target, "target");
		// console.log(formNodeTree.value, "formNodeTree.beforevalue");
		return new Promise<void>((resolve) => {
			if (target === undefined || target === null)
				return formNodeTree.value.push(node);
			// 找到 target 在formNodeTree 中的位置
			const nodeIndex = formNodeTree.value.findIndex(
				(formNode: FormNode) => formNode.id === node.id
			);
			const targetIndex = formNodeTree.value.findIndex(
				(formNode: FormNode) => formNode.id === target.id
			);
			if (targetIndex === -1) return;
			// const formNodeElements = document.querySelectorAll("[canFlip]");
			// console.log(formNodeElements, "formNodeElements");
			// const flip = new Flip(
			// 	Array.from(formNodeElements) as HTMLElement[],
			// 	0.08
			// );
			// flip.first();
			const animationManager = new AnimationManager({
				duration: 150, // 动画持续时间(毫秒)
				easing: "ease-in-out", // 可选，动画缓动函数
			});
			const container = document.getElementById("canvas-form") as HTMLElement;
			animationManager.captureAnimationState(container);
			if (nodeIndex !== -1) {
				if (targetIndex > nodeIndex) {
					formNodeTree.value.splice(nodeIndex, 1);
					formNodeTree.value.splice(targetIndex, 0, node);
				} else if (targetIndex < nodeIndex) {
					formNodeTree.value.splice(nodeIndex, 1);
					formNodeTree.value.splice(targetIndex, 0, node);
				} else {
					return;
				}
			} else {
				formNodeTree.value.splice(targetIndex, 0, node);
			}
			nextTick(async () => {
				await animationManager.animateAll();
				resolve();
			});
			// console.log(formNodeTree.value, "formNodeTree.aftervalue");
		});
	};

	const getFormNodePropObj = (id: string) => {
		const configs = formNodeTree.value.find(
			(formNode) => formNode.id === id
		)?.configs;
		const configPanelList = formNodeTree.value.find(
			(formNode) => formNode.id === id
		)?.configPanelList;
		return {
			id,
			configs,
			configPanelList,
		};
	};

	const updateFormNodeConfigs = (
		id: string,
		newConfigs: Record<string, any>
	) => {
		const formNode = formNodeTree.value.find((formNode) => formNode.id === id);
		if (formNode === undefined) return false;
		// console.log(newConfigs, "newConfigs");
		formNode.configs = newConfigs;
		return true;
	};

	return {
		formNodeTree,
		insertBefore,
		getFormNodePropObj,
		updateFormNodeConfigs,
	};
});
