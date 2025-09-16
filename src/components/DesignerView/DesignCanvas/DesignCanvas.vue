<template>
	<div
		:ref="drop"
		id="design-canvas"
		class="shrink h-10/12 mx-7 mb-4 aspect-square shadow-2xl overflow-scroll"
	>
		<!-- <el-form id="canvas-container" ref="form" label-width="auto"> -->
		<template v-for="formNode in formNodeTreeCmpType" :key="formNode.id">
			<DragWrapper :formNode="formNode">
				<component
					:is="formNode.type"
					:configs="formNode.configs"
					:childrens="formNode.childrens"
					:id="formNode.id"
				/>
			</DragWrapper>
		</template>
		<!-- </el-form> -->
	</div>
</template>

<script setup lang="ts">
import { useDrop } from "vue3-dnd";
import type {
	FormNode,
	FormNodeCmpType,
	FormNodeTemplate,
} from "@/types/index";
import { useComponentRegisterStore } from "@/stores/componentRegister";
import { useFormNodeTreeStore } from "@/stores/formNodeTree";
import { computed, ref, unref, watchEffect } from "vue";
import { v4 as uuidv4 } from "uuid";
import DragWrapper from "../../CommonComponents/DragWrapper.vue";
import { storeToRefs } from "pinia";
import { toRefs } from "@vueuse/core";
import { cloneDeep } from "lodash";
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
	const setCmpType = (
		FormNodeList: FormNode[] | undefined
	): FormNodeCmpType[] => {
		if (FormNodeList === undefined) return [];
		if (FormNodeList.length === 0) return [];
		return FormNodeList.map((formNode: FormNode): FormNodeCmpType => {
			return {
				...formNode,
				type: componentTypeMap[formNode.type],
				childrens: setCmpType(cloneDeep(formNode.childrens)),
			};
		});
	};
	return setCmpType(cloneDeep(unref(formNodeTree)));
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
		};
	},
});

const { isOver } = toRefs(dropCollect);

watchEffect(() => {
	if (isOver.value) {
		showPreview.value = true;
	} else {
		showPreview.value = false;
	}
});

// console.log(collect, "collect");
</script>

<style lang="scss" scoped>
#design-canvas {
	background-color: var(--color-bg-tertiary);
	border-right: 1px solid var(--color-border-base);

	&::-webkit-scrollbar {
		width: 5px;
		height: 5px;
		/* 滚动条的宽度 */
	}

	&::-webkit-scrollbar-track {
		background: var(--color-bg-tertiary);
		/* 滚动条轨道的背景颜色 */
		border-radius: 10px;
		/* 滚动条轨道的圆角 */
	}

	&::-webkit-scrollbar-thumb {
		background: var(--color-text-tertiary);
		/* 滚动条滑块的背景颜色 */
		border-radius: 10px;
		/* 滚动条滑块的圆角 */
	}

	/* 当鼠标悬停在滚动条上时 */
	&::-webkit-scrollbar-thumb:hover {
		background: var(--color-text-secondary);
		/* 滚动条滑块的悬停背景颜色 */
	}
}
</style>
