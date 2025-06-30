import { defineStore } from "pinia";
import { computed } from "vue";
import type { FormComponent } from "../types";

export const useComponentRegisterStore = defineStore(
	"componentRegister",
	() => {
		// 同步导入所有组件（eager模式）
		const modules = import.meta.glob<{ default: FormComponent }>(
			"../components/mountComponents/*.vue",
			{ eager: true }
		);
		// console.log(modules, "modules");
		//modules为一个对象，key为文件路径，value为文件内容

		// 直接提取组件默认导出
		const components: FormComponent[] = Object.values(modules).map(
			(module) => module.default
		);

		// 获取导出的组件选项内容
		// console.log(components, "components");

		// type类型/组件 对象映射表
		// type 写在节点树上作为组件类型，替代组件对象，减少节点树的重量
		const componentTypeMap = computed(() => {
			const map: Record<string, FormComponent> = {};
			components.forEach((component) => {
				map[component.type] = component;
			});
			return map;
		});

		return { components, componentTypeMap };
	}
);
