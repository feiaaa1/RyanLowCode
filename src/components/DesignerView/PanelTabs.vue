<template>
	<div id="panel-tabs" class="panel-tabs">
		<el-tabs v-model="currentPanel" tab-position="bottom" class="panel-tabs__shell">
			<el-tab-pane label="项目与页面" name="DataSourcePanel">
				<DataSourcePanel />
			</el-tab-pane>
			<el-tab-pane label="组件库" name="ComponentPanel">
				<ComponentPanel />
			</el-tab-pane>
			<el-tab-pane label="大纲树" name="OutlineTreePanel">
				<OutlineTreePanel />
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup lang="ts">
import DataSourcePanel from "@/components/DesignerView/Panels/DataSourcePanel.vue";
import { ref } from "vue";

const currentPanel = ref("DataSourcePanel");
</script>

<style scoped>
.panel-tabs,
.panel-tabs__shell {
	height: 100%;
}

:deep(.el-tabs) {
	height: 100%;
	display: flex;
	flex-direction: column-reverse;
}

:deep(.el-tabs__header) {
	padding: 20px 24px 0;
	margin: 0;
	flex-shrink: 0;
}

:deep(.el-tabs__nav-wrap) {
	padding-bottom: 12px;
}

:deep(.el-tabs__item) {
	height: 54px;
	line-height: 54px;
	font-size: 15px;
	padding: 0 22px;
	border-radius: 16px;
	margin-right: 12px;
}

:deep(.el-tabs__content) {
	flex: 1;
	min-height: 0;
}

:deep(.el-tab-pane) {
	height: 100%;
}
</style>
