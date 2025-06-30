<template>
	<el-button v-bind="$attrs" :style="props.style">{{ props.text }}</el-button>
</template>

<script setup lang="ts">
const props = defineProps({
	text: {
		type: String,
		default: "",
	},
	style: {
		type: Object,
		default: () => ({}),
	},
});
</script>

<style scoped></style>
