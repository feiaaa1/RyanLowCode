<template>
	<div :ref="drag">
		<el-button
			plain
			size="default"
			@click="addFormNode(props.formNode)"
			id="formNode"
			class="!active:cursor-move !cursor-move w-28 h-10 text-center leading-[38px] rounded-lg"
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
		return insertBefore(item as FormNode, currentFormNode.value, false);
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
#formNode {
	// border: 1px solid var(--color-border-base);
	// color: var(--color-text-primary);
	margin: 0;
}
</style>
