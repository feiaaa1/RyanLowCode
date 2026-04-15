<template>
	<el-dialog v-model="visible" title="提交记录" width="960px">
		<el-empty v-if="!projectId" description="请先选择项目" />
		<template v-else>
			<div class="submission-toolbar">
				<el-select v-model="statusFilter" placeholder="筛选状态" clearable style="width: 140px">
					<el-option label="成功" value="success" />
					<el-option label="失败" value="failed" />
				</el-select>
				<el-select v-model="pageFilter" placeholder="筛选页面" clearable style="width: 220px">
					<el-option v-for="page in pageOptions" :key="page.value" :label="page.label" :value="page.value" />
				</el-select>
				<el-button type="primary" :loading="loading" @click="loadSubmissions">刷新记录</el-button>
			</div>
			<el-table :data="submissions" v-loading="loading" max-height="460">
				<el-table-column label="页面" min-width="140">
					<template #default="{ row }">{{ row.pageId?.name || '-' }}</template>
				</el-table-column>
				<el-table-column label="状态" width="100">
					<template #default="{ row }">
						<el-tag :type="row.status === 'success' ? 'success' : 'danger'">
							{{ row.status === 'success' ? '成功' : '失败' }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="message" label="消息" min-width="180" show-overflow-tooltip />
				<el-table-column label="提交时间" width="180">
					<template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
				</el-table-column>
				<el-table-column label="数据" min-width="240">
					<template #default="{ row }">
						<pre class="submission-payload">{{ formatPayload(row.payload) }}</pre>
					</template>
				</el-table-column>
			</el-table>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { runtimeService } from "@/services/runtime";
import type { RuntimeSubmissionRecord } from "@/types";

const props = defineProps<{
	modelValue: boolean;
	projectId: string;
}>();

const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void;
}>();

const loading = ref(false);
const submissions = ref<RuntimeSubmissionRecord[]>([]);
const statusFilter = ref("");
const pageFilter = ref("");

const visible = computed({
	get: () => props.modelValue,
	set: (value: boolean) => emit("update:modelValue", value),
});

const pageOptions = computed(() => {
	const seen = new Map<string, string>();
	submissions.value.forEach((item) => {
		if (item.pageId?._id && item.pageId?.name && !seen.has(item.pageId._id)) {
			seen.set(item.pageId._id, item.pageId.name);
		}
	});
	return Array.from(seen.entries()).map(([value, label]) => ({ value, label }));
});

const loadSubmissions = async () => {
	if (!props.projectId) return;
	try {
		loading.value = true;
		const response = await runtimeService.listSubmissions(props.projectId, {
			status: statusFilter.value,
			pageId: pageFilter.value,
		});
		submissions.value = response.data ?? [];
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "加载提交记录失败");
	} finally {
		loading.value = false;
	}
};

watch(
	() => [visible.value, props.projectId],
	([isVisible, projectId]) => {
		if (isVisible && projectId) {
			void loadSubmissions();
		}
	},
	{ immediate: true }
);

watch([statusFilter, pageFilter], () => {
	if (visible.value && props.projectId) {
		void loadSubmissions();
	}
});

const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : "-");
const formatPayload = (payload: Record<string, unknown>) => JSON.stringify(payload, null, 2);
</script>

<style scoped>
.submission-toolbar {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	margin-bottom: 12px;
	flex-wrap: wrap;
}

.submission-payload {
	white-space: pre-wrap;
	word-break: break-word;
	font-size: 12px;
	line-height: 1.5;
	margin: 0;
}
</style>
