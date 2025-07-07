<template>
	<div :ref="((ref: Element) => {
		if (!props.formNode.nodeType.includes('NODRAG')) {
			drag(ref);
		}
		drop(ref);
	}) as any
		" class="relative w-fit cursor-move"
		:class="{ active: currentFormNode?.id == props.formNode.id, normal: currentFormNode?.id != props.formNode.id }"
		canFlip @click.stop="handleClick">
		<el-tooltip effect="dark" content="删除" placement="top">
			<button @click.stop="deleteFormNode(props.formNode.id)" v-if="currentFormNode?.id == props.formNode.id"
				class="z-50 w-5 h-4 bg-blue-600 absolute -top-4 -right-[2px] flex items-center justify-center cursor-pointer">
				<Delete class="w-4 h-4 text-white" />
			</button>
		</el-tooltip>
		<el-tooltip effect="dark" :content="props.formNode.id" placement="top">
			<div v-if="currentFormNode?.id == props.formNode.id"
				class="z-50 w-fit text-[14px] text-white h-4 bg-blue-600 absolute -top-4 right-[20px] flex items-center justify-center cursor-pointer">
				ID
			</div>
		</el-tooltip>
		<div v-if="currentFormNode?.id == props.formNode.id"
			class="z-50 w-fit text-[14px] text-white h-4 bg-blue-600 absolute -top-4 right-[37px] flex items-center justify-center cursor-pointer">
			{{ props.formNode.name }}
		</div>

		<!-- 插入预览样式 -->
		<template v-if="showPreview">
			<div class="relative left-0 right-0 h-3 bg-transparent "></div>
			<div class="relative left-0 right-0 h-1 bg-blue-600 "></div>
			<div class="relative left-0 right-0 h-3 bg-transparent "></div>
		</template>

		<!--悬浮样式 -->
		<div :style="{ opacity: isDragging || !canDrag ? 0 : 1 }"
			class="absolute -inset-0.5 border-2 border-dashed hover:border-blue-600 border-transparent z-10 bg-transparent">
			<div id="drag-wrapper-model" :style="{ opacity: isDragging || !canDrag ? 0 : 0.15 }"
				class="absolute inset-0 z-10 hover:bg-blue-600 bg-transparent"></div>
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
import { useFormNodeTreeStore } from "@/stores/formNodeTree";
import { useComponentRegisterStore } from "@/stores/componentRegister";
import { usePropertyPanelStore } from "@/stores/PropertyPanel";
import { cloneDeep, isObject } from "lodash";
import { onMounted, ref, useTemplateRef, watchEffect, computed, watch } from "vue";
import { toRefs } from "@vueuse/core";
import { v4 } from "uuid";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";

const formNodeTreeStore = useFormNodeTreeStore();
const { insertBefore, insertInto, deleteFormNode } = formNodeTreeStore;
// const { currentInsertTargetNode, insertTaskQueue } = storeToRefs(formNodeTreeStore);


const componentRegisterStore = useComponentRegisterStore();
const { componentTypeMap } = componentRegisterStore;

const propertyPanelStore = usePropertyPanelStore();
const { changeCurrentFormNode } = propertyPanelStore;
const { currentFormNode } = storeToRefs(propertyPanelStore)

const handleClick = () => {
	changeCurrentFormNode(props.formNode);
}


const props = defineProps<{
	formNode: FormNodeCmpType;
}>();

// watch(() => props.formNode, (val) => {
// 	console.log(val, "val");
// }, {
// 	deep: true
// }
// )


// 编写 INNER 节点拖拽逻辑
const [dragCollect, drag] = useDrag({
	type: "INNERFORMNODE",
	item: () => {
		// console.log(props.formNode, "props.formNode");
		return props.formNode
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
	hover: async (formNodeCmpType: FormNodeCmpType | FormNodeTemplate, monitor) => {
		if (props.formNode.nodeType !== "NESTED") {
			// 若是为FormNodeTemplate类型，则直接不执行该逻辑
			if (monitor.getItemType() === "FORMNODE") {
				showPreview.value = true;
				return
			};

			// 如果当前被放置元素正在进行动画，则不再执行交换逻辑
			if (isFlip.value) return
			console.log(formNodeCmpType, "formNodeCmpType");
			// 深拷贝传入的两个节点
			const insertFormNode: FormNode = cloneDeep(
				formNodeCmpType
			) as unknown as FormNode;
			const formNode: FormNode = cloneDeep(props.formNode) as unknown as FormNode;
			// 如果放置节点和拖拽节点是同一个，直接无视
			if ((insertFormNode as unknown as FormNodeCmpType).id === props.formNode.id)
				return;

			insertFormNode.type = (
				insertFormNode.type as unknown as FormComponent
			).type;

			isFlip.value = true;
			// console.log(insertFormNode, "insertFormNode");
			// console.log(formNode, "formNode");
			await insertBefore(insertFormNode, formNode, true);
			isFlip.value = false;
		}

	},

	// 放置逻辑
	// 如果拖拽节点是 INNERFORMNODE 类型，若当前放置节点是 NESTED 可嵌套类型，则将拖拽节点插入到当前节点中
	// 如果拖拽节点是 FORMNODE 类型，放置节点是 NESTED 可嵌套类型则将当前节点插入到当前节点之中，否则插入当前节点之前
	drop: async (formNodeTemplate: FormNodeTemplate | FormNodeCmpType, monitor) => {
		// console.log(formNodeTemplate, "formNodeTemplate");
		// 判断是否是是发生在当前目标的嵌套目标内， 确保逻辑只作用在最顶部当前元素
		if (monitor.isOver({ shallow: true })) {
			if (monitor.getItemType() === "INNERFORMNODE") {
				if (props.formNode.nodeType !== "NESTED") return
				if (props.formNode.id == (formNodeTemplate as unknown as FormNode).id) return
				// 深拷贝传入的两个节点
				const insertFormNode: FormNode = cloneDeep(
					formNodeTemplate
				) as unknown as FormNode;
				const formNode: FormNode = cloneDeep(props.formNode) as unknown as FormNode;
				insertFormNode.type = (insertFormNode.type as unknown as FormComponent).type;
				deleteFormNode((insertFormNode as unknown as FormNodeCmpType).id);
				insertInto(insertFormNode, formNode);
			} else if (monitor.getItemType() === "FORMNODE") {
				// 深拷贝传入的两个节点
				const insertFormNode: FormNode = cloneDeep(
					formNodeTemplate
				) as unknown as FormNode;
				const formNode: FormNode = cloneDeep(props.formNode) as unknown as FormNode;
				//处理 FormNodeTemplate 类型
				(insertFormNode as unknown as FormNodeCmpType).id = v4();
				// console.log(insertFormNode.type, "aftertype");
				if (props.formNode.nodeType === "NESTED") {
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
		}
	}
});

const { isOver, itemType } = toRefs(dropCollect);

watchEffect(() => {
	if (itemType.value === "FORMNODE" && isOver.value && props.formNode.nodeType !== "NESTED") {
		showPreview.value = true;
	}
	if (!isOver.value) {
		showPreview.value = false;
	}
})

const dragElement = useTemplateRef<HTMLDivElement>("dragElement");
</script>

<style lang="scss" scoped>
.active {
	border: 2px solid #155dfc;
}

.normal {
	border: 2px solid transparent;
}
</style>
