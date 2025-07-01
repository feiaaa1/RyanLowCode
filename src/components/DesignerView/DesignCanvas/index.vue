<template>
	<div :ref="drop" id="design-canvas" class="ml-5 h-11/12 aspect-square shadow-lg">
		<el-form id="canvas-container" ref="form" label-width="auto">
			<transition-group>
				<template v-for="formNode in formNodeTreeCmpType" :key="formNode.id">
					<DragWrapper :formNode="formNode">
						<component :is="formNode.type" :configs="formNode.configs" />
					</DragWrapper>
				</template>
				<template v-if="showPreview">
					<div class="relative - h-3 bg-transparent " :style="{ width: item.configs.style.width }"></div>
					<div class="relative  h-1 bg-blue-600 " :style="{ width: item.configs.style.width }"></div>
					<div class="relative  h-3 bg-transparent " :style="{ width: item.configs.style.width }"></div>
				</template>
			</transition-group>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { useDrop } from "vue3-dnd";
import type { FormNode, FormNodeTemplate } from "@/types/index";
import { useComponentRegisterStore } from "@/stores/componentRegister";
import { useFormNodeTreeStore } from "@/stores/formNodeTree";
import { computed, ref, unref, watchEffect } from "vue";
import { v4 as uuidv4 } from "uuid";
import DragWrapper from "./child/DragWrapper.vue";
import { storeToRefs } from "pinia";
import { toRefs } from "@vueuse/core";

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

const showPreview = ref(false);

const [dropCollect, drop] = useDrop({
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
	collect: (monitor) => {
		return {
			isOver: monitor.isOver({ shallow: true }),
			item: monitor.getItem(),
		}
	}
});

const { isOver, item } = toRefs(dropCollect);

watchEffect(() => {
	if (isOver.value) {
		showPreview.value = true;
	} else {
		showPreview.value = false;
	}
})

// console.log(collect, "collect");
</script>

<style lang="scss" scoped>
#design-canvas {
	background-color: var(--color-bg-tertiary);
	border-right: 1px solid var(--color-border-base);
}
</style>
