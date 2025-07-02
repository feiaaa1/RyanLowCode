<template>
	<div :ref="((ref: Element) => {
		drag(ref);
		drop(ref);
	}) as any
		" class="relative w-fit cursor-move" canFlip @click="handleClick">

		<!-- 悬浮样式 -->
		<div :style="{ opacity: isDragging || !canDrag ? 0 : 1 }"
			class="absolute -inset-0.5 border-2 border-dashed hover:border-blue-600 border-transparent z-10 bg-transparent">
			<div id="drag-wrapper-model" :style="{ opacity: isDragging || !canDrag ? 0 : 0.15 }"
				class="absolute inset-0 z-10 hover:bg-blue-600 bg-transparent"></div>
		</div>

		<!-- 选中样式 -->
		<!-- <div :style="{ opacity: currentFormNode?.id != props.formNode.id ? 0 : 1 }"
			class="absolute -inset-0.5 border-2 border-solid border-blue-600  z-9 bg-transparent">
		</div> -->
		<div ref="dragElement" class="pointer-events-none">
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
import { onMounted, ref, useTemplateRef, watchEffect, computed } from "vue";
import { toRefs } from "@vueuse/core";
import { v4 } from "uuid";
import { storeToRefs } from "pinia";

const formNodeTreeStore = useFormNodeTreeStore();
const { insertBefore } = formNodeTreeStore;

const componentRegisterStore = useComponentRegisterStore();
const { componentTypeMap } = componentRegisterStore;

const propertyPanelStore = usePropertyPanelStore();
const { changeCurrentFormNode } = propertyPanelStore;
const { currentFormNode } = storeToRefs(propertyPanelStore)

const handleClick = () => {
	// changeCurrentFormNode(props.formNode);
}


const props = defineProps<{
	formNode: FormNodeCmpType;
}>();

// const cloneInsertFormNode = computed(() => {
//   return   
// })
// ;

const [collect, drag] = useDrag({
	type: "INNERFORMNODE",
	item: props.formNode,
	collect: (monitor) => {
		return {
			isDragging: monitor.isDragging(),
			canDrag: monitor.canDrag(),
		};
	},
});

const { isDragging, canDrag } = toRefs(collect);

const isFlip = ref(false);


const [, drop] = useDrop({
	accept: ["INNERFORMNODE", "FORMNODE"],
	hover: async (formNodeCmpType: FormNodeCmpType | FormNodeTemplate, monitor) => {
		// 若是为FormNodeTemplate类型，则直接不执行该逻辑
		if (!('id' in formNodeCmpType)) return
		if (isFlip.value) return
		// 立即触发逻辑
		// 如果动画正在播放，不执行交换动作
		// if (currentInsertTargetNode.id === ) return;
		if (!formNodeCmpType.id) return
		// console.log(formNodeCmpType, "formNodeCmpType");
		// 深拷贝传入的两个节点
		const insertFormNode: FormNode = cloneDeep(
			formNodeCmpType
		) as unknown as FormNode;
		const formNode: FormNode = cloneDeep(props.formNode) as unknown as FormNode;
		if ((insertFormNode as unknown as FormNodeCmpType).id === props.formNode.id)
			return;
		// 处理 FormNodeCmpType 类型
		// console.log(insertFormNode.type, "type");

		insertFormNode.type = (
			insertFormNode.type as unknown as FormComponent
		).type;

		isFlip.value = true;
		console.log(insertFormNode, "insertFormNode");
		await insertBefore(insertFormNode, formNode);
		isFlip.value = false;
	},
	drop: async (formNodeTemplate: FormNodeTemplate | FormNodeCmpType) => {
		// console.log(formNodeTemplate, "formNodeTemplate");
		if (!formNodeTemplate) return;
		if ((formNodeTemplate as unknown as FormNodeCmpType).id !== undefined) return;
		// 深拷贝传入的两个节点
		const insertFormNode: FormNode = cloneDeep(
			formNodeTemplate
		) as unknown as FormNode;
		const formNode: FormNode = cloneDeep(props.formNode) as unknown as FormNode;
		//处理 FormNodeTemplate 类型
		(insertFormNode as unknown as FormNodeCmpType).id = v4();
		// console.log(insertFormNode.type, "aftertype");
		await insertBefore(insertFormNode, formNode);
	},
});

const dragElement = useTemplateRef<HTMLDivElement>("dragElement");
</script>

<style lang="scss" scoped>
.active {
	position: absolute;
	inset: -0.5px;
	border: 2px dashed #ccc;
	border-radius: 4px;
	opacity: 0;
	transition: opacity 0.3s ease-in-out;
	z-index: 9;
}
</style>
