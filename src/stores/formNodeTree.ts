import { defineStore, storeToRefs } from "pinia";
import type { FormNode, FormNodeCmpType } from "@/types/index";
import { computed, ref } from "vue";
import { AnimationManager } from "@/utils/animation";
import { nextTick } from "vue";
import { ElMessage } from "element-plus";
import { cloneDeep } from "lodash";
import { useCommandManager } from "./commandManager";
import { createRootFormNode, normalizeFormNodeTree } from "@/utils/formSchema";
import {
	AddNodeCommand,
	ModifyNodeCommand,
	DeleteNodeCommand,
	CompositeNodeCommand,
} from "@/stores/commandManager";

const commandManagerStore = useCommandManager();
const { commandManager } = storeToRefs(commandManagerStore);

interface Info {
	path: number[];
	array: FormNode[];
	index: number;
}
export const useFormNodeTreeStore = defineStore("formNodeTree", () => {
	const formNodeTree = ref<FormNode[]>([createRootFormNode()]);

	const insertBefore = (
		node: FormNode,
		target: FormNode | null | undefined,
		animation = false,
		insertAfter = false
	) => {
		return new Promise<void>((resolve) => {
			if (target === undefined || target === null) return formNodeTree.value.push(node);
			const nodeInfo = findNodeById(node.id, formNodeTree.value);
			const targetInfo = findNodeById(target.id, formNodeTree.value);
			if (!targetInfo) {
				console.error("未找到目标节点", target.id);
				return;
			}

			let animationManager: AnimationManager | null = null;
			if (animation) {
				animationManager = new AnimationManager({
					duration: 100,
					easing: "ease-in-out",
				});
				const container = document.getElementById("design-canvas") as HTMLElement;
				animationManager.captureAnimationState(container);
			}
			if (nodeInfo) {
				if (nodeInfo.array === targetInfo.array) {
					if (targetInfo.index > nodeInfo.index) {
						commandManager.value.execute(
							new CompositeNodeCommand(
								new DeleteNodeCommand(nodeInfo.array, nodeInfo.index),
								new AddNodeCommand(targetInfo.array, node, targetInfo.index)
							)
						);
					} else if (targetInfo.index < nodeInfo.index) {
						commandManager.value.execute(
							new CompositeNodeCommand(
								new DeleteNodeCommand(nodeInfo.array, nodeInfo.index),
								new AddNodeCommand(targetInfo.array, node, targetInfo.index)
							)
						);
					} else {
						console.error("目标节点和插入节点索引相同");
						return;
					}
				} else {
					let isTargetAboveNode = false;
					for (const index in targetInfo.path) {
						if (targetInfo.path[index] > nodeInfo.path[index]) {
							isTargetAboveNode = false;
							break;
						} else if (targetInfo.path[index] < nodeInfo.path[index]) {
							isTargetAboveNode = true;
							break;
						} else if (targetInfo.path[index] === nodeInfo.path[index]) {
							continue;
						}
					}
					if (isTargetAboveNode) {
						commandManager.value.execute(
							new CompositeNodeCommand(
								new DeleteNodeCommand(nodeInfo.array, nodeInfo.index),
								new AddNodeCommand(targetInfo.array, node, targetInfo.index)
							)
						);
					} else {
						commandManager.value.execute(
							new CompositeNodeCommand(
								new DeleteNodeCommand(nodeInfo.array, nodeInfo.index),
								new AddNodeCommand(targetInfo.array, node, targetInfo.index + 1)
							)
						);
					}
				}
			} else if (insertAfter) {
				commandManager.value.execute(
					new AddNodeCommand(targetInfo.array, node, targetInfo.index + 1)
				);
			} else {
				commandManager.value.execute(
					new AddNodeCommand(targetInfo.array, node, targetInfo.index)
				);
			}
			if (animation) {
				nextTick(() => {
					nextTick(() => {
						if (animationManager === null) return resolve();
						animationManager.animateAll(() => {
							resolve();
						});
					});
				});
			} else {
				resolve();
			}
		});
	};

	const deleteFormNode = (id: string) => {
		const nodeInfo = findNodeById(id, formNodeTree.value);
		if (!nodeInfo) {
			console.error("未找到目标节点", id);
			return;
		}
		commandManager.value.execute(
			new DeleteNodeCommand(nodeInfo.array, nodeInfo.index)
		);
	};

	const insertInto = (node: FormNode, target: FormNode) => {
		if (!target.nodeType.includes("NESTED")) return;
		const targetInfo = findNodeById(target.id, formNodeTree.value);

		if (!targetInfo) {
			console.error("未找到目标节点", target.id);
			return;
		}
		const targetFormNode = targetInfo.array[targetInfo.index];

		if (targetFormNode.childrens === undefined) targetFormNode.childrens = [];
		commandManager.value.execute(
			new AddNodeCommand(targetFormNode.childrens, node, -1)
		);
	};

	const findNodeById = (
		id: string,
		formNodeArray: FormNode[],
		path: number[] = []
	): Info | false => {
		for (const index in formNodeArray) {
			const formNode = formNodeArray[index];
			if (formNode.id == id) {
				return {
					array: formNodeArray,
					index: Number(index),
					path: path.concat(Number(index)),
				};
			}
			if (formNode.childrens && formNode.childrens.length > 0) {
				const res = findNodeById(id, formNode.childrens, path.concat(Number(index)));
				if (res) return res;
			}
		}
		return false;
	};

	const getFormNodePropObj = (id: string) => {
		const findNodeById = (
			nodes: FormNode[],
			targetId: string
		): FormNode | undefined => {
			for (const node of nodes) {
				if (node.id === targetId) {
					return node;
				}
				if (node.childrens && node.childrens.length > 0) {
					const foundNode = findNodeById(node.childrens, targetId);
					if (foundNode) {
						return foundNode;
					}
				}
			}
			return undefined;
		};
		const formNode = findNodeById(formNodeTree.value, id);
		if (formNode === undefined) return false;
		const { configs, configPanelList } = cloneDeep(formNode) as FormNode;
		return {
			id,
			configs,
			configPanelList,
		};
	};

	const updateFormNodeConfigs = (id: string, newConfigs: Record<string, any>) => {
		const findNodeById = (
			nodes: FormNode[],
			targetId: string
		): FormNode | undefined => {
			for (const node of nodes) {
				if (node.id === targetId) {
					return node;
				}
				if (node.childrens && node.childrens.length > 0) {
					const foundNode = findNodeById(node.childrens, targetId);
					if (foundNode) {
						return foundNode;
					}
				}
			}
			return undefined;
		};
		const formNode = findNodeById(formNodeTree.value, id);
		if (formNode === undefined) return ElMessage.error("未找到目标节点");
		commandManager.value.execute(
			new ModifyNodeCommand(formNode, "configs", newConfigs)
		);
	};

	const getFormNodePath = (formNode: FormNode | FormNodeCmpType) => {
		const findNodePath = (
			nodes: FormNode[],
			targetNode: FormNode | FormNodeCmpType,
			path: string[] = []
		): string[] | false => {
			for (const index in nodes) {
				const node = nodes[index];
				if (node.id === targetNode.id) {
					return path.concat(node.name);
				}
				if (node.childrens && node.childrens.length > 0) {
					const res = findNodePath(node.childrens, targetNode, path.concat(node.name));
					if (res) return res;
				}
			}
			return false;
		};
		return findNodePath(formNodeTree.value, formNode);
	};

	const replaceFormNodeTree = (nodes: FormNode[]) => {
		formNodeTree.value = normalizeFormNodeTree(cloneDeep(nodes));
	};

	const hasPersistedChange = computed(() => {
		if (formNodeTree.value.length !== 1) return true;
		const rootNode = formNodeTree.value[0];
		return Boolean(rootNode?.childrens?.length);
	});

	return {
		formNodeTree,
		hasPersistedChange,
		insertBefore,
		getFormNodePropObj,
		updateFormNodeConfigs,
		insertInto,
		deleteFormNode,
		getFormNodePath,
		findNodeById,
		replaceFormNodeTree,
	};
});
