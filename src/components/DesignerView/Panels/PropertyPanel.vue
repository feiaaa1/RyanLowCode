<template>
	<div id="property-panel" class="w-[400px] shrink h-full ">
		<template v-if="Object.keys(formList).length > 0">
			<el-form v-for="(value, key) in formList" :key="key" :ref="'form' + key" label-width=" 80px">
				<el-form-item v-for="(item, index) in value" :key="index" :label="item.label" :prop="item.prop">
					<template v-if="item.type === 'input'">
						<el-input :placeholder="item.placeholder" :maxLength="20"
							v-model="form[key][item.prop]"></el-input>
					</template>
					<template v-else-if="item.type === 'select'">
						<<el-select v-model="form[key][item.prop]" :placeholder="item.placeholder" clearable>
							<el-option v-for="optionItem in item.options" :key="optionItem.value"
								:label="optionItem.label" :value="optionItem.value"></el-option>
							</el-select>
					</template>
					<template v-else>
						<span>无该类型表单</span>
					</template>
				</el-form-item>
			</el-form>
		</template>
	</div>
</template>

<script setup lang="ts">
import { usePropertyPanelStore } from '@/stores/PropertyPanel';
import { storeToRefs } from 'pinia';
import { useFormNodeTreeStore } from '@/stores/formNodeTree';
import { ref, toRaw, watch, watchEffect } from 'vue';
import type { FormNode, ConfigPanelList } from '@/types/index';
import { toRefs } from '@vueuse/core';
import { ElMessage } from 'element-plus';

const propertyPanelStore = usePropertyPanelStore();
const { currentFormNode } = storeToRefs(propertyPanelStore);


const formNodeTreeStore = useFormNodeTreeStore();
const { getFormNodePropObj, updateFormNodeConfigs } = formNodeTreeStore;
const { formNodeTree } = storeToRefs(formNodeTreeStore);

const form = ref<Record<string, any>>({})
const formList = ref<ConfigPanelList>({})

watch(currentFormNode, () => {
	if (currentFormNode && currentFormNode.value?.id) {
		const { configs, id, configPanelList } = getFormNodePropObj(currentFormNode.value.id)
		if (!configs || !configPanelList || !id) return ElMessage.error('获取表单节点属性失败')
		formList.value = configPanelList
		form.value = configs
	} else {
		// 重置状态
		form.value = {}
		formList.value = {}
	}
})

watch(form, (newVal, oldVal) => {
	if (newVal && currentFormNode.value?.id) {
		// console.log(form.value, 'form.value')
		// console.log(newVal, 'newVal')
		updateFormNodeConfigs(currentFormNode.value.id, newVal)
	} else {
		// 重置状态
		form.value = {}
		formList.value = {}
	}
}, {
	deep: true
})


</script>

<style lang="scss" scoped>
#property-panel {
	background-color: var(--color-bg-tertiary);
}
</style>
