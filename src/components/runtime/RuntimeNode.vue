<template>
	<template v-if="isFormNode">
		<el-form class="runtime-form" label-position="top">
			<template v-for="child in node.childrens ?? []" :key="child.id">
				<RuntimeNode :node="child" v-model="model" />
			</template>
		</el-form>
	</template>

	<template v-else-if="isLayoutNode">
		<div class="runtime-layout" :style="styleObject">
			<template v-for="child in node.childrens ?? []" :key="child.id">
				<RuntimeNode :node="child" v-model="model" />
			</template>
		</div>
	</template>

	<template v-else-if="isLayoutItemNode">
		<div class="runtime-layout-item" :style="styleObject">
			<template v-for="child in node.childrens ?? []" :key="child.id">
				<RuntimeNode :node="child" v-model="model" />
			</template>
		</div>
	</template>

	<template v-else-if="node.type === 'input'">
		<el-form-item :label="fieldLabel" :required="isRequired" :style="itemStyle">
			<el-input v-model="stringValue" v-bind="inputProps" :style="controlStyle" />
			<small v-if="fieldHint" class="runtime-hint">{{ fieldHint }}</small>
		</el-form-item>
	</template>

	<template v-else-if="node.type === 'datePicker'">
		<el-form-item :label="fieldLabel" :required="isRequired" :style="itemStyle">
			<el-date-picker v-model="dateValue" type="date" v-bind="dateProps" :style="controlStyle" />
		</el-form-item>
	</template>

	<template v-else>
		<div class="runtime-unknown">暂不支持组件：{{ node.name }}</div>
	</template>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { FormNode } from "@/types";

const model = defineModel<Record<string, unknown>>({ required: true });

const props = defineProps<{
	node: FormNode;
}>();

const isFormNode = computed(() => props.node.type === "form");
const isLayoutNode = computed(() => props.node.type === "layout");
const isLayoutItemNode = computed(() => props.node.type === "layoutItem");

const fieldKey = computed(() => props.node.configs?.props?.item_field ?? props.node.configs?.props?._field ?? "");
const fieldLabel = computed(() => props.node.configs?.props?.item_label ?? props.node.configs?.props?._label ?? props.node.name);
const fieldHint = computed(() => {
	const validate = props.node.configs?.validate ?? {};
	if (validate.min && validate.max) return `长度 ${validate.min}-${validate.max}`;
	if (validate.min) return `最少 ${validate.min} 个字符`;
	if (validate.max) return `最多 ${validate.max} 个字符`;
	return "";
});
const isRequired = computed(() => Boolean(props.node.configs?.validate?.required));

const toStyleObject = (styleSource: Record<string, unknown> = {}) => {
	const result: Record<string, string> = {};
	Object.entries(styleSource).forEach(([key, value]) => {
		if (value === undefined || value === null || value === "") return;
		result[key] = String(value);
	});
	return result;
};

const rawStyle = computed(() => props.node.configs?.style ?? {});
const styleObject = computed(() => toStyleObject(rawStyle.value));
const itemStyle = computed(() => {
	const source = rawStyle.value;
	const result: Record<string, string> = {};
	Object.entries(source).forEach(([key, value]) => {
		if (!key.startsWith("item-") || value === undefined || value === null || value === "") return;
		result[key.replace(/^item-/, "")] = String(value);
	});
	return result;
});
const controlStyle = computed(() => {
	const source = rawStyle.value;
	const result: Record<string, string> = {};
	Object.entries(source).forEach(([key, value]) => {
		if (key.startsWith("item-") || value === undefined || value === null || value === "") return;
		result[key] = String(value);
	});
	return result;
});

const inputProps = computed(() => {
	const propsConfig = { ...(props.node.configs?.props ?? {}) };
	delete propsConfig.item_field;
	delete propsConfig.item_label;
	delete propsConfig.item_labelWidth;
	delete propsConfig.item_labelPosition;
	return propsConfig;
});

const dateProps = computed(() => {
	const propsConfig = { ...(props.node.configs?.props ?? {}) };
	delete propsConfig._field;
	delete propsConfig._label;
	delete propsConfig._labelWidth;
	return propsConfig;
});

const stringValue = computed({
	get: () => String(model.value[fieldKey.value] ?? ""),
	set: (value: string) => {
		if (!fieldKey.value) return;
		model.value = {
			...model.value,
			[fieldKey.value]: value,
		};
	},
});

const dateValue = computed({
	get: () => (model.value[fieldKey.value] as string | undefined) ?? "",
	set: (value: string) => {
		if (!fieldKey.value) return;
		model.value = {
			...model.value,
			[fieldKey.value]: value,
		};
	},
});
</script>

<style scoped>
.runtime-form,
.runtime-layout,
.runtime-layout-item {
	width: 100%;
}

.runtime-hint {
	display: block;
	margin-top: 6px;
	color: var(--color-text-tertiary);
}

.runtime-unknown {
	padding: 14px 16px;
	border-radius: 14px;
	background: rgba(248, 113, 113, 0.12);
	color: #fda4af;
}
</style>
