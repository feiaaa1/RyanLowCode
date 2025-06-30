<template>
	<div :ref="drag">
		<el-button plain size="default" @click="addFormNode(props.formNode)" id="formNode"
			class="!active:cursor-move !cursor-move w-28 h-10 text-center leading-[38px] rounded-lg">
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

const props = defineProps<{
	formNode: FormNodeTemplate;
}>();

const formNodeTreeStore = useFormNodeTreeStore();
const { insertBefore } = formNodeTreeStore;

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
	insertBefore(item as FormNode, null);
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
