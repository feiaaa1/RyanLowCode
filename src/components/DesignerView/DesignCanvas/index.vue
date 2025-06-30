<template>
	<div :ref="drop" id="design-canvas" class="ml-5 h-11/12 aspect-square shadow-lg">
		<el-form ref="form" label-width="auto">
			<template v-for="formNode in formNodeTreeCmpType" :key="formNode.id">
				<DragWrapper :formNode="formNode">
					<component :is="formNode.type" :configs="formNode.configs" />
				</DragWrapper>
			</template>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { useDrop } from "vue3-dnd";
import type { FormNode, FormNodeTemplate } from "@/types/index";
import { useComponentRegisterStore } from "@/stores/componentRegister";
import { useFormNodeTreeStore } from "@/stores/formNodeTree";
import { computed, unref } from "vue";
import { v4 as uuidv4 } from "uuid";
import DragWrapper from "./child/DragWrapper.vue";
import { storeToRefs } from "pinia";

defineOptions({
	name: "DesignCanvas",
});
const componentRegisterStore = useComponentRegisterStore();
const { componentTypeMap } = componentRegisterStore;

const formNodeTreeStore = useFormNodeTreeStore();
const { formNodeTree } = storeToRefs(formNodeTreeStore);
const { insertBefore } = formNodeTreeStore;

// console.log(formNodeTree, "formNodeTree");

const formNodeTreeCmpType = computed(() => {
	return unref(formNodeTree).map((formNode: FormNode) => {
		return {
			...formNode,
			type: componentTypeMap[formNode.type],
		};
	});
});

const [, drop] = useDrop({
	accept: "FORMNODE",
	drop: (item: FormNodeTemplate, monitor) => {
		if (monitor.isOver({ shallow: true })) {

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
		}
	},
});

// console.log(collect, "collect");
</script>

<style lang="scss" scoped>
#design-canvas {
	background-color: var(--color-bg-tertiary);
	border-right: 1px solid var(--color-border-base);
}
</style>
