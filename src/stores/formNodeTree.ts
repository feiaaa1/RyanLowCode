import { defineStore } from "pinia";
import type { FormNode, FormNodeCmpType } from "@/types/index";
import { ref, watch } from "vue";
import { Flip } from "@/utils/flip";
import { nextTick } from "vue";
import { ElMessage } from "element-plus";
export const useFormNodeTreeStore = defineStore("formNodeTree", () => {
	const formNodeTree = ref<FormNode[]>([]);
	// 定义插入任务缓冲队列
	const insertTaskQueue = ref<{ fn: Function; args: any[] }[]>([]);
	// 定义当前正在进行插入的目标节点
	const currentInsertTargetNode = ref<FormNode | null | FormNodeCmpType>(null);

	const addTask = (fn: Function, args: any[]) => {
		insertTaskQueue.value.push({ fn, args });
		// console.log(insertTaskQueue.value, "insertTaskQueue");
	};

	const isRunning = ref(false);

	watch(
		insertTaskQueue,
		(newVal, oldVal) => {
			// console.log(oldVal, "oldVal");
			// console.log(newVal, "newVal");
			if (isRunning.value) return;
			if (newVal.length > 0) {
				console.log("开始插入");
				runInsertTask();
			}
		},
		{ deep: true }
	);

	const runInsertTask = async () => {
		isRunning.value = true;

		try {
			while (insertTaskQueue.value.length > 0) {
				const task = insertTaskQueue.value.shift();
				if (task) {
					await task.fn(...task.args);
				}
			}
		} catch (error) {
			console.error(error);
			ElMessage.error("插入失败" + error);
		} finally {
			isRunning.value = false;
		}
	};

	const insertBefore = (
		node: FormNode,
		target: FormNode | null | undefined
	) => {
		console.log(node, "node");
		console.log(target, "target");
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
			const formNodeElements = document.querySelectorAll("[canFlip]");
			// console.log(formNodeElements, "formNodeElements");
			const flip = new Flip(
				Array.from(formNodeElements) as HTMLElement[],
				0.08
			);
			flip.first();
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
				await flip.play();
				resolve();
			});
			// console.log(formNodeTree.value, "formNodeTree.aftervalue");
		});
	};

	return {
		formNodeTree,
		insertBefore,
		addTask,
		insertTaskQueue,
		currentInsertTargetNode,
	};
});
