<template>
	<div
		id="property-panel"
		class="w-[400px] shrink h-full p-4 flex flex-col items-center justify-start overflow-y-scroll"
	>
		<template v-if="Object.keys(groupedFormList).length > 0">
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
					v-for="(value, key) in groupedFormList"
					:key="key"
				>
					<template #title>
						<div class="text-lg">
							<span>{{ getSectionLabel(key) }}</span>
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
									:maxLength="80"
									v-model="getModelGroup(key)[item.prop]"
								></el-input>
							</template>
							<template v-else-if="item.type === 'select'">
								<el-select
									v-model="getModelGroup(key)[item.prop]"
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
									v-model="getModelGroup(key)[item.prop]"
									:min="1"
									:max="100"
								/>
							</template>
							<template v-else-if="item.type === 'switch'">
								<el-switch
									v-model="getModelGroup(key)[item.prop]"
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
import { computed, ref, watch } from "vue";
import type { ConfigPanelItem, ConfigPanelList } from "@/types/index";
import { ElMessage } from "element-plus";
import { ArrowRight } from "@element-plus/icons-vue";

const propertyPanelStore = usePropertyPanelStore();
const { currentFormNode } = storeToRefs(propertyPanelStore);

const formNodeTreeStore = useFormNodeTreeStore();
const { getFormNodePropObj, updateFormNodeConfigs, getFormNodePath } =
	formNodeTreeStore;
storeToRefs(formNodeTreeStore);

const form = ref<Record<string, any>>({});
const formList = ref<ConfigPanelList>({});

const activeNames = ref<string[]>([]);

const submitPropSet = new Set([
	"submit_mode",
	"submit_endpoint",
	"submit_method",
	"submit_successMessage",
	"submit_resetAfterSubmit",
	"submit_successAction",
	"submit_redirectUrl",
]);

const sectionLabels: Record<string, string> = {
	props: "属性",
	submit: "提交配置",
	validate: "校验",
	style: "样式",
};

const getSectionLabel = (key: string) => sectionLabels[key] ?? key;

const groupedFormList = computed(() => {
	const result: ConfigPanelList = {};
	Object.entries(formList.value).forEach(([key, value]) => {
		if (key === "props") {
			const propsItems = (value ?? []) as ConfigPanelItem[];
			const submitItems = propsItems.filter((item) => submitPropSet.has(item.prop));
			const normalProps = propsItems.filter((item) => !submitPropSet.has(item.prop));
			if (normalProps.length) result.props = normalProps;
			if (submitItems.length) result.submit = submitItems;
			return;
		}
		if ((value ?? []).length) {
			result[key] = value;
		}
	});
	return result;
});

const getModelGroup = (key: string) => {
	if (key === "submit" || key === "props") {
		form.value.props = form.value.props ?? {};
		return form.value.props;
	}
	form.value[key] = form.value[key] ?? {};
	return form.value[key];
};

watch(currentFormNode, () => {
	if (currentFormNode && currentFormNode.value?.id) {
		const res = getFormNodePropObj(currentFormNode.value.id);
		if (res === false) return ElMessage.error("获取表单节点属性失败");
		const { configs, id, configPanelList } = res;
		if (!configs || !configPanelList || !id)
			return ElMessage.error("获取表单节点属性失败");
		formList.value = configPanelList;
		form.value = configs;
		activeNames.value = Object.keys(groupedFormList.value);
	} else {
		form.value = {};
		formList.value = {};
		activeNames.value = [];
	}
});

const currentFormNodeNamePath = computed(() => {
	if (currentFormNode.value) return getFormNodePath(currentFormNode.value);
	else return [];
});

watch(
	form,
	(newVal) => {
		if (newVal && currentFormNode.value?.id) {
			updateFormNodeConfigs(currentFormNode.value.id, newVal);
		} else {
			form.value = {};
			formList.value = {};
			activeNames.value = [];
		}
	},
	{
		deep: true,
	}
);
</script>

<style lang="scss" scoped>
#property-panel {
	background-color: #fff;
	border-left: 1px solid var(--color-border-base);
}
</style>
