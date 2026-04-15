<template>
	<div class="runtime-page">
		<el-card class="runtime-shell" shadow="hover">
			<template #header>
				<div class="runtime-shell__header">
					<div>
						<p class="runtime-shell__eyebrow">Runtime</p>
						<h1>{{ pageTitle }}</h1>
					</div>
					<el-tag :type="pageStatus === 'published' ? 'success' : 'warning'">
						{{ pageStatus === 'published' ? '已发布页面' : '草稿预览' }}
					</el-tag>
				</div>
			</template>

			<el-skeleton v-if="loading" :rows="8" animated />
			<el-result v-else-if="errorMessage" icon="error" title="页面加载失败" :sub-title="errorMessage" />
			<div v-else class="runtime-canvas">
				<RuntimeRenderer :nodes="runtimeNodes" v-model="formModel" />
				<el-alert
					v-if="submitMessage"
					:title="submitMessage"
					:type="submitMessageType"
					show-icon
					:closable="false"
				/>
				<el-card v-if="proxyResponseText" class="runtime-response" shadow="never">
					<template #header>代理响应</template>
					<pre>{{ proxyResponseText }}</pre>
				</el-card>
				<div class="runtime-actions">
					<el-button type="primary" :loading="submitting" @click="handleSubmit">提交表单</el-button>
					<el-button @click="resetForm">重置</el-button>
				</div>
			</div>
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import type { FormNode } from "@/types";
import { runtimeService } from "@/services/runtime";
import RuntimeRenderer from "@/components/runtime/RuntimeRenderer.vue";

const route = useRoute();
const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref("");
const submitMessage = ref("");
const submitMessageType = ref<"success" | "error">("success");
const pageTitle = ref("运行时页面");
const pageStatus = ref<"draft" | "published">("draft");
const runtimeNodes = ref<FormNode[]>([]);
const formModel = ref<Record<string, unknown>>({});
const initialModel = ref<Record<string, unknown>>({});
const proxyResponse = ref<unknown>(null);

const pageId = computed(() => String(route.params.pageId ?? ""));
const proxyResponseText = computed(() => (proxyResponse.value ? JSON.stringify(proxyResponse.value, null, 2) : ""));

const collectInitialValues = (nodes: FormNode[], seed: Record<string, unknown> = {}) => {
	nodes.forEach((node) => {
		const field = node.configs?.props?.item_field ?? node.configs?.props?._field;
		if (field && seed[field] === undefined) {
			seed[field] = "";
		}
		if (node.childrens?.length) {
			collectInitialValues(node.childrens, seed);
		}
	});
	return seed;
};

const loadRuntimePage = async () => {
	loading.value = true;
	errorMessage.value = "";
	try {
		const response = await runtimeService.getPage(pageId.value);
		pageTitle.value = response.data?.name ?? "运行时页面";
		pageStatus.value = response.data?.status ?? "draft";
		runtimeNodes.value = response.data?.formNodeTree ?? [];
		initialModel.value = collectInitialValues(runtimeNodes.value, {});
		formModel.value = { ...initialModel.value };
	} catch (error) {
		errorMessage.value = error instanceof Error ? error.message : "页面加载失败";
	} finally {
		loading.value = false;
	}
};

const handleSubmit = async () => {
	try {
		submitting.value = true;
		submitMessage.value = "";
		proxyResponse.value = null;
		const response = await runtimeService.submitPage(pageId.value, formModel.value);
		submitMessageType.value = "success";
		submitMessage.value = response.data?.message || response.message || "表单提交成功";
		proxyResponse.value = response.data?.proxyResponse ?? null;
		ElMessage.success(submitMessage.value);

		if (response.data?.resetAfterSubmit ?? true) {
			resetForm();
			submitMessage.value = response.data?.message || response.message || "表单提交成功";
			proxyResponse.value = response.data?.proxyResponse ?? null;
		}

		if (response.data?.successAction === "redirect" && response.data?.redirectUrl) {
			window.setTimeout(() => {
				window.location.href = response.data?.redirectUrl as string;
			}, 800);
		}
	} catch (error) {
		submitMessageType.value = "error";
		submitMessage.value = error instanceof Error ? error.message : "表单提交失败";
		ElMessage.error(submitMessage.value);
	} finally {
		submitting.value = false;
	}
};

const resetForm = () => {
	formModel.value = { ...initialModel.value };
	submitMessage.value = "";
	proxyResponse.value = null;
};

onMounted(async () => {
	await loadRuntimePage();
});
</script>

<style scoped>
.runtime-page {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 32px;
	background:
		radial-gradient(circle at top, rgba(96, 165, 250, 0.18), transparent 28%),
		linear-gradient(180deg, #0b1220 0%, #111827 100%);
}

.runtime-shell {
	width: min(1080px, 100%);
	border-radius: 28px;
}

.runtime-shell__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 16px;
}

.runtime-shell__eyebrow {
	font-size: 11px;
	letter-spacing: 0.24em;
	text-transform: uppercase;
	color: var(--color-text-tertiary);
	margin-bottom: 6px;
}

.runtime-shell h1 {
	font-size: 30px;
	color: var(--color-text-primary);
}

.runtime-canvas {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.runtime-actions {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}

.runtime-response pre {
	white-space: pre-wrap;
	word-break: break-word;
	font-size: 13px;
	color: var(--color-text-secondary);
}
</style>
