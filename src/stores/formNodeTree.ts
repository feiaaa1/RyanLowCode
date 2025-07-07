import { defineStore } from "pinia";
import type { FormNode, FormNodeCmpType } from "@/types/index";
import { ref, watch } from "vue";
import { AnimationManager } from "@/utils/animation";
import { nextTick } from "vue";
import { ElMessage } from "element-plus";
import { v4 as v4uuid } from "uuid";
import { cloneDeep } from "lodash";

interface Info {
	path: number[]; // 用于比对嵌套节点的位置，便于插入正确显示，上面的节点插入下面的节点插入到下面节点的后面，反过来则反之
	array: FormNode[];
	index: number;
}
export const useFormNodeTreeStore = defineStore("formNodeTree", () => {
	const formNodeTree = ref<FormNode[]>([
		{
			id: v4uuid(),
			type: "form",
			nodeType: ["NESTED", "NODRAG"],
			name: "表单",
			configs: {
				style: {
					width: "660px",
					minHeight: "660px",
					padding: "20px",
				},
			},
			configPanelList: {
				props: [],
				validate: [],
				style: [
					{
						prop: "width",
						defaultValue: "640px",
						type: "input",
						label: "宽度",
					},
					{
						prop: "minHeight",
						defaultValue: "640px",
						type: "input",
						label: "最小高度",
					},
					{
						prop: "padding",
						defaultValue: "20px",
						type: "input",
						label: "内边距",
					},
				],
			},
			children: [],
		},
	]);

	// 将 node
	const insertBefore = (
		node: FormNode,
		target: FormNode | null | undefined,
		animation = false
	) => {
		// console.log(node, "node");
		// console.log(target, "target");
		// // console.log(formNodeTree.value, "formNodeTree.beforevalue");
		return new Promise<void>((resolve) => {
			if (target === undefined || target === null)
				return formNodeTree.value.push(node);
			// 找到 node 在formNodeTree 中的位置，包含所在的父节点
			const nodeInfo = findNodeById(node.id, formNodeTree.value);
			// 找到 target 在formNodeTree 中的位置，包含所在的父节点
			const targetInfo = findNodeById(target.id, formNodeTree.value);
			// 未找到插入目标节点，直接返回
			if (!targetInfo) {
				console.error("未找到目标节点", target.id);
				return;
			}
			// // console.log(formNodeElements, "formNodeElements");"
			// let flip: Flip | null = null;

			let animationManager: AnimationManager | null = null;
			// 如果需要动画效果
			if (animation) {
				// 创建当前动画实例
				animationManager = new AnimationManager({
					duration: 100, // 动画持续时间(毫秒)
					easing: "ease-in-out", // 可选，动画缓动函数
				});
				const container = document.getElementById(
					"design-canvas"
				) as HTMLElement;
				animationManager.captureAnimationState(container);
				// flip = new Flip(Array.from(formNodeElements) as HTMLElement[], 0.15);
				// flip.first();
			}
			// 如果 node 存在于 formNodeTree 中，则从 formNodeTree 中移除
			if (nodeInfo) {
				if (nodeInfo.array === targetInfo.array) {
					// console.log(nodeInfo, "nodeInfo", targetInfo, "targetInfo");
					if (targetInfo.index > nodeInfo.index) {
						nodeInfo.array.splice(nodeInfo.index, 1);
						targetInfo.array.splice(targetInfo.index, 0, node);
					} else if (targetInfo.index < nodeInfo.index) {
						nodeInfo.array.splice(nodeInfo.index, 1);
						targetInfo.array.splice(targetInfo.index, 0, node);
					} else {
						console.error("目标节点和插入节点索引相同");
						return;
					}
				} else {
					// 如果是跨容器插入，则将 node 从原来的父节点中移除，并插入到目标节点的前面
					// 根据 Info 中的 path，判断位置关系
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
						nodeInfo.array.splice(nodeInfo.index, 1);
						targetInfo.array.splice(targetInfo.index, 0, node);
					} else {
						nodeInfo.array.splice(nodeInfo.index, 1);
						targetInfo.array.splice(targetInfo.index + 1, 0, node);
					}
				}
			} else {
				targetInfo.array.splice(targetInfo.index, 0, node);
			}
			if (animation) {
				nextTick(() => {
					if (animationManager === null) return resolve();
					animationManager.animateAll(() => {
						// console.log("动画完成");
						resolve();
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
		nodeInfo.array.splice(nodeInfo.index, 1);
	};

	// 插入到指定节点内部作为子节点
	const insertInto = (node: FormNode, target: FormNode) => {
		const targetInfo = findNodeById(target.id, formNodeTree.value);

		if (!targetInfo) {
			console.error("未找到目标节点", target.id);
			return;
		}
		const targetFormNode = targetInfo.array[targetInfo.index];

		if (targetFormNode.children === undefined) targetFormNode.children = [];
		targetFormNode.children.push(node);
		// console.log(targetFormNode, "targetFormNode");
		// console.log(formNodeTree.value, "formNodeTree");
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
			if (formNode.children && formNode.children.length > 0) {
				const res = findNodeById(
					id,
					formNode.children,
					path.concat(Number(index))
				);
				if (res) return res;
			}
		}
		console.error("未找到节点", id, formNodeArray);
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
				if (node.children && node.children.length > 0) {
					const foundNode = findNodeById(node.children, targetId);
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

	const updateFormNodeConfigs = (
		id: string,
		newConfigs: Record<string, any>
	) => {
		const findNodeById = (
			nodes: FormNode[],
			targetId: string
		): FormNode | undefined => {
			for (const node of nodes) {
				if (node.id === targetId) {
					return node;
				}
				if (node.children && node.children.length > 0) {
					const foundNode = findNodeById(node.children, targetId);
					if (foundNode) {
						return foundNode;
					}
				}
			}
			return undefined;
		};
		const formNode = findNodeById(formNodeTree.value, id);
		if (formNode === undefined) return ElMessage.error("未找到目标节点");
		// // console.log(newConfigs, "newConfigs");
		formNode.configs = newConfigs;
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
				if (node.children && node.children.length > 0) {
					const res = findNodePath(
						node.children,
						targetNode,
						path.concat(node.name)
					);
					if (res) return res;
				}
			}
			return false;
		};
		return findNodePath(formNodeTree.value, formNode);
	};

	return {
		formNodeTree,
		insertBefore,
		getFormNodePropObj,
		updateFormNodeConfigs,
		insertInto,
		deleteFormNode,
		getFormNodePath,
	};
});
