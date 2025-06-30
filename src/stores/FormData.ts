import { defineStore } from "pinia";
import { ref } from "vue";

export const useFormDataStore = defineStore("formData", () => {
	const formData = ref<Record<string, any>>({});

	const setFormData = (formName: string, data: any) => {
		formData.value[formName] = data;
	};

	const getFormData = (formName: string) => {
		return formData.value[formName];
	};

	const deleteFormData = (formName: string) => {
		delete formData.value[formName];
	};

	return {
		formData,
		setFormData,
		getFormData,
		deleteFormData,
	};
});
