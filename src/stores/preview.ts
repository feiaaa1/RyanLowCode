import { defineStore } from "pinia";
import { ref } from "vue";

export const usePreviewStore = defineStore("preview", () => {
	const isPreview = ref(false);
	const changePreview = (value: boolean) => {
		isPreview.value = value;
	};

	return {
		isPreview,
		changePreview,
	};
});
