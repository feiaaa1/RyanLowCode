<template>
	<div id="top-toolbar" class="flex items-center justify-end p-2 w-full h-full">
		<RyButton
			@click="handleClick"
			:style="{ padding: '4px 20px' }"
			text="预览"
		/>
		<RyButton :style="{ padding: '4px 20px' }" text="导出" />
	</div>
</template>

<script setup lang="ts">
const handleClick = () => {
	console.log("预览");
};
</script>

<style lang="scss" scoped>
#top-toolbar {
	background-color: var(--color-bg-tertiary);
	border: 1px solid var(--color-border-dark);
	padding: 4px;
}
</style>
