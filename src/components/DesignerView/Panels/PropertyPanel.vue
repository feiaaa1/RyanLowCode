<template>
	<div
		id="property-panel"
		class="w-[400px] shrink h-full p-4 flex flex-col items-center justify-start overflow-y-scroll"
	>
		<template v-if="Object.keys(formList).length > 0">
			<el-breadcrumb class="w-full m-h-6 mb-2" :separator-icon="ArrowRight">
				<el-breadcrumb-item
					class="mb-1"
					v-for="(item, index) in currentFormNodeNamePath"
					:key="index"
					>{{ item }}</el-breadcrumb-item
				>
			</el-breadcrumb>
			<el-collapse class="w-full" v-model="activeNames">
				<el-collapse-item
					:name="key"
					v-for="(value, key) in formList"
					:key="key"
				>
					<template #title="{ isActive }">
						<div class="text-lg">
							<span v-if="key === 'props'"> 属性 </span>
							<span v-else-if="key === 'validate'"> 校验 </span>
							<span v-if="key === 'style'"> 样式 </span>
						</div>
					</template>
					<el-form :ref="'form' + key" label-width="auto">
						<el-form-item
							v-for="(item, index) in value"
							:key="index"
							:label="item.label"
							:prop="item.prop"
						>
							<template v-if="item.type === 'input'">
								<el-input
									:placeholder="item.placeholder"
									:maxLength="20"
									v-model="form[key][item.prop]"
								></el-input>
							</template>
							<template v-else-if="item.type === 'select'">
								<el-select
									v-model="form[key][item.prop]"
									:placeholder="item.placeholder"
									clearable
								>
									<el-option
										v-for="optionItem in item.options"
										:key="optionItem.value"
										:label="optionItem.label"
										:value="optionItem.value"
									></el-option>
								</el-select>
							</template>
							<template v-else-if="item.type === 'input-number'">
								<el-input-number
									v-model="form[key][item.prop]"
									:min="1"
									:max="100"
								/>
							</template>
							<template v-else-if="item.type === 'switch'">
								<el-switch
									v-model="form[key][item.prop]"
									:active-value="true"
									:inactive-value="false"
								></el-switch>
							</template>
							<template v-else>
								<span>无该类型表单</span>
							</template>
						</el-form-item>
					</el-form>
				</el-collapse-item>
			</el-collapse>
		</template>

		<el-empty v-else description="请选择页面节点" />
	</div>
</template>

<script setup lang="ts">
import { usePropertyPanelStore } from "@/stores/PropertyPanel";
import { storeToRefs } from "pinia";
import { useFormNodeTreeStore } from "@/stores/formNodeTree";
import { computed, ref, toRaw, watch, watchEffect } from "vue";
import type { FormNode, ConfigPanelList } from "@/types/index";
import { toRefs } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { ArrowRight } from "@element-plus/icons-vue";

const propertyPanelStore = usePropertyPanelStore();
const { currentFormNode } = storeToRefs(propertyPanelStore);

const formNodeTreeStore = useFormNodeTreeStore();
const { getFormNodePropObj, updateFormNodeConfigs, getFormNodePath } =
	formNodeTreeStore;
const { formNodeTree } = storeToRefs(formNodeTreeStore);

const form = ref<Record<string, any>>({});
const formList = ref<ConfigPanelList>({});

const activeNames = ref<string[]>([]);

watch(currentFormNode, () => {
	if (currentFormNode && currentFormNode.value?.id) {
		const res = getFormNodePropObj(currentFormNode.value.id);
		if (res === false) return ElMessage.error("获取表单节点属性失败");
		const { configs, id, configPanelList } = res;
		if (!configs || !configPanelList || !id)
			return ElMessage.error("获取表单节点属性失败");
		formList.value = configPanelList;
		form.value = configs;
	} else {
		// 重置状态
		form.value = {};
		formList.value = {};
	}
});

const currentFormNodeNamePath = computed(() => {
	if (currentFormNode.value) return getFormNodePath(currentFormNode.value);
	else return [];
});

watch(
	form,
	(newVal, oldVal) => {
		if (newVal && currentFormNode.value?.id) {
			// console.log(form.value, 'form.value')
			// console.log(newVal, 'newVal')
			updateFormNodeConfigs(currentFormNode.value.id, newVal);
		} else {
			// 重置状态
			form.value = {};
			formList.value = {};
		}
	},
	{
		deep: true,
	}
);
</script>

<style lang="scss" scoped>
#property-panel {
	background-color: var(--color-bg-tertiary);
	border-left: 1px solid var(--color-border-base);
}
</style>
