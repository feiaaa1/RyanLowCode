<template>
	<div :ref="drag" class="drag-form-node">
		<el-button
			plain
			size="large"
			@click="addFormNode(props.formNode)"
			id="formNode"
			class="drag-form-node__button"
		>
			{{ props.formNode.name }}
		</el-button>
	</div>
</template>

<script setup lang="ts">
import type { FormNodeTemplate, FormNode } from "@/types";
import { watchEffect } from "vue";
import { useDrag } from "vue3-dnd";
import { useFormNodeTreeStore } from "@/stores/formNodeTree";
import { v4 as uuidv4 } from "uuid";

import { usePropertyPanelStore } from "@/stores/PropertyPanel";
import { storeToRefs } from "pinia";
const propertyPanelStore = usePropertyPanelStore();
const { currentFormNode } = storeToRefs(propertyPanelStore);

const props = defineProps<{
	formNode: FormNodeTemplate;
}>();

const formNodeTreeStore = useFormNodeTreeStore();
const { insertInto, findNodeById, insertBefore } = formNodeTreeStore;
const { formNodeTree } = storeToRefs(formNodeTreeStore);

const addFormNode = (item: FormNodeTemplate) => {
	item = JSON.parse(JSON.stringify(item));
	Object.defineProperty(item, "id", {
		value: uuidv4(),
		writable: false,
		enumerable: true,
		configurable: false,
	});
	Object.defineProperty(item, "formName", {
		value: "",
		writable: false,
		enumerable: true,
		configurable: false,
	});
	if (currentFormNode.value === null)
		return insertInto(item as FormNode, formNodeTree.value[0]);
	const currentFormNodeInfo = findNodeById(
		currentFormNode.value.id,
		formNodeTree.value
	);
	if (currentFormNodeInfo === false) return;
	currentFormNode.value = currentFormNodeInfo.array[currentFormNodeInfo.index];
	if (currentFormNode.value?.nodeType.includes("NESTED"))
		return insertInto(item as FormNode, currentFormNode.value);
	else if (currentFormNode.value?.nodeType.includes("ORDINARY"))
		return insertBefore(item as FormNode, currentFormNode.value, false, true);
};

const [, drag] = useDrag({
	type: "FORMNODE",
	item: {
		...props.formNode,
	},
	collect: (monitor) => ({
		isDragging: monitor.isDragging(),
	}),
});

watchEffect(() => {
	// console.log(unref(collect));
});
</script>

<style lang="scss" scoped>
.drag-form-node {
	width: 100%;
	height: 100%;
}

.drag-form-node__button {
	width: 100%;
	min-height: 88px;
	padding: 18px 12px;
	font-size: 16px;
	line-height: 1.4;
	text-align: center;
	border-radius: 20px;
}
</style>
