1.提供悬浮样式 2.提供插入预览样式 3.提供 INNER 组件拖拽和被放置逻辑

<template>
	<div
		:ref="setNodeRef"
		class="relative w-fit cursor-move"
		:style="{ width: isRoot ? '100%' : 'fit-content' }"
		:class="{ active: isActive, normal: !isActive }"
		canFlip
		@click.stop="handleClick"
	>
		<!-- 顶部组件操作 -->
		<el-tooltip
			effect="dark"
			content="删除"
			placement="top"
			v-if="isActive && !isRoot"
		>
			<button
				@click.stop="deleteFormNode(props.formNode.id)"
				class="z-50 w-5 h-4 bg-blue-600 absolute -top-4 -right-[2px] flex items-center justify-center cursor-pointer"
				:style="{ top: isRoot ? '0px' : '-16px' }"
			>
				<Delete class="w-4 h-4 text-white" />
			</button>
		</el-tooltip>
		<el-tooltip
			effect="dark"
			:content="props.formNode.id"
			placement="top"
			v-if="isActive"
		>
			<div
				class="z-50 w-fit text-[14px] text-white h-4 bg-blue-600 absolute -top-4 right-[20px] flex items-center justify-center cursor-pointer"
				:style="{ top: isRoot ? '0px' : '-16px' }"
			>
				ID
			</div>
		</el-tooltip>
		<div
			v-if="isActive"
			class="z-50 w-fit text-[14px] text-white h-4 bg-blue-600 absolute -top-4 right-[37px] flex items-center justify-center cursor-pointer"
			:style="{ top: isRoot ? '0px' : '-16px' }"
		>
			{{ props.formNode.name }}
		</div>

		<!-- 插入预览样式 -->
		<template v-if="showPreview">
			<div class="relative left-0 right-0 h-3 bg-transparent"></div>
			<div class="relative left-0 right-0 h-1 bg-blue-600"></div>
			<div class="relative left-0 right-0 h-3 bg-transparent"></div>
		</template>

		<!--悬浮样式 -->
		<div
			:style="{ opacity: isDragging || !canDrag ? 0 : 1 }"
			class="absolute -inset-0.5 border-2 border-dashed hover:border-blue-600 border-transparent z-10 bg-transparent"
		>
			<div
				id="drag-wrapper-model"
				:style="{ opacity: isDragging || !canDrag ? 0 : 0.15 }"
				class="absolute inset-0 z-10 hover:bg-blue-600 bg-transparent"
			></div>
		</div>

		<div ref="dragElement">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useDrag, useDrop } from "vue3-dnd";
import type {
	FormComponent,
	FormNode,
	FormNodeCmpType,
	FormNodeTemplate,
} from "@/types/index";
import deepProcessArray from "@/utils/deepProcess";
import { useFormNodeTreeStore } from "@/stores/formNodeTree";
import { useComponentRegisterStore } from "@/stores/componentRegister";
import { usePropertyPanelStore } from "@/stores/PropertyPanel";
import { cloneDeep, isObject } from "lodash";
import {
	onMounted,
	ref,
	useTemplateRef,
	watchEffect,
	computed,
	watch,
	unref,
} from "vue";
import { toRefs } from "@vueuse/core";
import { v4 } from "uuid";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";

// 组件节点树状态
const formNodeTreeStore = useFormNodeTreeStore();
const { insertBefore, insertInto, deleteFormNode } = formNodeTreeStore;
// const { currentInsertTargetNode, insertTaskQueue } = storeToRefs(formNodeTreeStore);

// 组件注册状态
const componentRegisterStore = useComponentRegisterStore();
const { componentTypeMap } = componentRegisterStore;

// 组件面板状态
const propertyPanelStore = usePropertyPanelStore();
const { changeCurrentFormNode } = propertyPanelStore;
const { currentFormNode } = storeToRefs(propertyPanelStore);

// 点击事件,传入节点
const handleClick = () => {
	changeCurrentFormNode(props.formNode);
};

// 需要传入组件节点
const props = withDefaults(
	defineProps<{
		formNode: FormNodeCmpType;
		width?: string;
		minHeight?: string;
	}>(),
	{
		width: "auto",
		minHeight: "auto",
	}
);

const isActive = computed(
	() => unref(currentFormNode)?.id === props.formNode.id
);
const isRoot = computed(() => props.formNode.nodeType.includes("ROOT"));

const setNodeRef = ((ref: Element) => {
	if (!props.formNode.nodeType.includes("NODRAG")) drag(ref);
	drop(ref);
}) as any;

// 编写 INNER 节点拖拽逻辑
const [dragCollect, drag] = useDrag({
	type: "INNERFORMNODE",
	item: () => {
		// console.log(props.formNode, "props.formNode");
		return props.formNode;
	},
	collect: (monitor) => {
		return {
			isDragging: monitor.isDragging(),
			canDrag: monitor.canDrag(),
		};
	},
});
const { isDragging, canDrag } = toRefs(dragCollect);

// 编写 INNER 节点放置逻辑
// 能够接收
// 1. 左侧节点模板 FORMNODE
// 2. 内部节点 INNERFORMNODE
const isFlip = ref(false);
const showPreview = ref(false);
const [dropCollect, drop] = useDrop({
	accept: ["INNERFORMNODE", "FORMNODE"],
	// 用于进行拖拽排序进行位置交换
	// 获取放置在当前节点上的节点，以及当前被放置节点，根据这个信息插入节点并进行动画
	// 可嵌套节点无视拖拽排序
	// 左侧节点模板情况
	// 不进行节点换位，但对当前放置元素进行插入预览样式显示
	hover: async (
		formNodeCmpType: FormNodeCmpType | FormNodeTemplate,
		monitor
	) => {
		if (monitor.isOver({ shallow: true })) {
			if (!props.formNode.nodeType.includes("NESTED")) {
				// 若是为FormNodeTemplate类型，则直接不执行该逻辑
				if (monitor.getItemType() === "FORMNODE") {
					showPreview.value = true;
					return;
				}

				// 如果当前被放置元素正在进行动画，则不再执行交换逻辑
				if (isFlip.value) return;
				// console.log(formNodeCmpType, "formNodeCmpType");
				// 深拷贝传入的两个节点
				let insertFormNode: FormNode = cloneDeep(
					formNodeCmpType
				) as unknown as FormNode;
				const formNode: FormNode = cloneDeep(
					props.formNode
				) as unknown as FormNode;
				// 如果放置节点和拖拽节点是同一个，直接无视
				if (
					(insertFormNode as unknown as FormNodeCmpType).id ===
					props.formNode.id
				)
					return;

				insertFormNode.type = (
					insertFormNode.type as unknown as FormComponent
				).type;
				if (insertFormNode.childrens)
					insertFormNode = deepProcessArray(
						insertFormNode,
						"childrens",
						(node) => {
							// console.log(node, 'node');
							if (typeof node.type === "string") return;
							node.type = (node.type as unknown as FormComponent).type;
						}
					);

				isFlip.value = true;
				// console.log(insertFormNode, "insertFormNode");
				// console.log(formNode, "formNode");
				await insertBefore(insertFormNode, formNode, true);
				isFlip.value = false;
			}
		}
	},

	// 放置逻辑
	// 如果拖拽节点是 INNERFORMNODE 类型，若当前放置节点是 NESTED 可嵌套类型，则将拖拽节点插入到当前节点中
	// 如果拖拽节点是 FORMNODE 类型，放置节点是 NESTED 可嵌套类型则将当前节点插入到当前节点之中，否则插入当前节点之前
	drop: async (
		formNodeTemplate: FormNodeTemplate | FormNodeCmpType,
		monitor
	) => {
		if (props.formNode.nodeType.includes("NODROP")) return;
		// console.log(formNodeTemplate, "formNodeTemplate");
		// 判断是否是是发生在当前目标的嵌套目标内， 确保逻辑只作用在最顶部当前元素
		if (monitor.isOver({ shallow: true })) {
			if (monitor.getItemType() === "INNERFORMNODE") {
				if (!props.formNode.nodeType.includes("NESTED")) return;
				// 自己放置自己时不执行逻辑
				// if (props.formNode.id == (formNodeTemplate as unknown as FormNode).id) return
				if (
					checkUniformId(
						props.formNode.id,
						formNodeTemplate as unknown as FormNode
					)
				)
					return;
				// 深拷贝传入的两个节点
				let insertFormNode: FormNode = cloneDeep(
					formNodeTemplate
				) as unknown as FormNode;
				const formNode: FormNode = cloneDeep(
					props.formNode
				) as unknown as FormNode;
				insertFormNode.type = (
					insertFormNode.type as unknown as FormComponent
				).type;
				// 如果插入节点有子节点，递归改变插入节点的type
				if (insertFormNode.childrens)
					insertFormNode = deepProcessArray(
						insertFormNode,
						"childrens",
						(node) => {
							// console.log(node, 'node');
							if (typeof node.type === "string") return;
							node.type = (node.type as unknown as FormComponent).type;
						}
					);
				// 如果insertFormNode有childrens，就循环递归改变type
				deleteFormNode((insertFormNode as unknown as FormNodeCmpType).id);
				insertInto(insertFormNode, formNode);
			} else if (monitor.getItemType() === "FORMNODE") {
				// 深拷贝传入的两个节点
				const insertFormNode: FormNode = cloneDeep(
					formNodeTemplate
				) as unknown as FormNode;
				const formNode: FormNode = cloneDeep(
					props.formNode
				) as unknown as FormNode;
				//处理 FormNodeTemplate 类型
				(insertFormNode as unknown as FormNodeCmpType).id = v4();
				// console.log(insertFormNode.type, "aftertype");
				if (props.formNode.nodeType.includes("NESTED")) {
					insertInto(insertFormNode, formNode);
				} else {
					await insertBefore(insertFormNode, formNode, false);
				}
			}
		}
	},
	collect: (monitor) => {
		return {
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
			itemType: monitor.getItemType(),
		};
	},
});

// 起个英文名，用于检查目标id以及内部所有子节点的id是否相同
const checkUniformId = (
	targetId: string,
	targetNode: FormNodeCmpType | FormNode
): boolean => {
	if (targetNode.id == targetId) return true;
	if (targetNode.childrens) {
		return targetNode.childrens.some((childNode) => {
			return checkUniformId(targetId, childNode);
		});
	}
	return false;
};

const { isOver, itemType } = toRefs(dropCollect);

watchEffect(() => {
	if (
		itemType.value === "FORMNODE" &&
		isOver.value &&
		!props.formNode.nodeType.includes("NESTED")
	) {
		showPreview.value = true;
	}
	if (!isOver.value) {
		showPreview.value = false;
	}
});
</script>

<style lang="scss" scoped>
.active {
	border: 2px solid #155dfc;
}

.normal {
	border: 2px solid transparent;
}
</style>
