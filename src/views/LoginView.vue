<template>
	<div class="min-h-screen auth-shell" data-theme="light">
		<section class="auth-hero">
			<p class="auth-kicker">Ryan LowCode</p>
			<h1>把认证、项目与页面编辑串成一条真正可用的链路。</h1>
			<p class="auth-copy">
				登录后即可拉取项目、选择页面，并将当前设计画布保存回后端。
			</p>
		</section>
		<section class="auth-card">
			<div class="auth-card__header">
				<h2>{{ isRegisterMode ? "创建账号" : "欢迎回来" }}</h2>
				<p>{{ isRegisterMode ? "先注册，再直接进入工作台" : "登录后继续编辑你的低代码页面" }}</p>
			</div>

			<el-form :model="form" label-position="top" @submit.prevent>
				<el-form-item v-if="isRegisterMode" label="用户名">
					<el-input v-model="form.username" placeholder="例如：Ryan" />
				</el-form-item>
				<el-form-item label="邮箱">
					<el-input v-model="form.email" placeholder="you@example.com" />
				</el-form-item>
				<el-form-item label="密码">
					<el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
				</el-form-item>
				<el-button class="auth-submit" type="primary" :loading="authStore.loading" @click="handleSubmit">
					{{ isRegisterMode ? "注册并进入" : "登录" }}
				</el-button>
			</el-form>

			<button class="auth-switch" @click="isRegisterMode = !isRegisterMode">
				{{ isRegisterMode ? "已有账号？去登录" : "还没有账号？去注册" }}
			</button>
		</section>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const isRegisterMode = ref(false);
const form = reactive({
	username: "",
	email: "",
	password: "",
});

const handleSubmit = async () => {
	if (!form.email || !form.password || (isRegisterMode.value && !form.username)) {
		ElMessage.warning("请完整填写表单");
		return;
	}

	try {
		if (isRegisterMode.value) {
			await authStore.register({
				username: form.username,
				email: form.email,
				password: form.password,
			});
			ElMessage.success("注册成功");
		} else {
			await authStore.login({
				email: form.email,
				password: form.password,
			});
			ElMessage.success("登录成功");
		}
		const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/";
		await router.replace(redirect);
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : "操作失败");
	}
};
</script>

<style scoped>
.auth-shell {
	display: grid;
	grid-template-columns: 1.2fr 0.9fr;
	background:
		radial-gradient(circle at top left, rgba(37, 99, 235, 0.14), transparent 32%),
		radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.12), transparent 28%),
		linear-gradient(135deg, #f8fbff 0%, #eef5ff 45%, #e5eefb 100%);
	color: #0f172a;
}

.auth-hero,
.auth-card {
	padding: 72px;
}

.auth-hero {
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 20px;
}

.auth-kicker {
	text-transform: uppercase;
	letter-spacing: 0.4em;
	font-size: 12px;
	color: #0f766e;
}

.auth-hero h1 {
	font-size: 56px;
	line-height: 1.08;
	font-weight: 700;
	max-width: 680px;
}

.auth-copy {
	max-width: 520px;
	font-size: 17px;
	color: rgba(15, 23, 42, 0.72);
}

.auth-card {
	align-self: center;
	width: min(480px, 92vw);
	border: 1px solid rgba(148, 163, 184, 0.24);
	background: rgba(255, 255, 255, 0.78);
	backdrop-filter: blur(20px);
	border-radius: 28px;
	box-shadow: 0 32px 80px rgba(15, 23, 42, 0.12);
}

.auth-card__header {
	margin-bottom: 28px;
}

.auth-card__header h2 {
	font-size: 32px;
	margin-bottom: 8px;
}

.auth-card__header p {
	color: rgba(15, 23, 42, 0.64);
}

.auth-submit,
.auth-switch {
	width: 100%;
}

.auth-submit {
	margin-top: 8px;
	height: 44px;
	border-radius: 14px;
}

.auth-switch {
	margin-top: 16px;
	border: 0;
	background: transparent;
	color: #0f766e;
	cursor: pointer;
}

:deep(.el-form-item__label) {
	color: rgba(15, 23, 42, 0.86);
}

:deep(.el-input__wrapper) {
	border-radius: 14px;
	background: rgba(255, 255, 255, 0.92);
	box-shadow: none;
}

@media (max-width: 960px) {
	.auth-shell {
		grid-template-columns: 1fr;
	}

	.auth-hero {
		padding-bottom: 0;
	}

	.auth-hero h1 {
		font-size: 40px;
	}

	.auth-card {
		margin: 24px;
		padding: 36px 24px;
	}
}
</style>
