// export default function deepProcessArray<T extends Record<string, any>>(
// 	array: T[],
// 	childrensField: string,
// 	callback: (item: T, index: number, parent: T[]) => void
// ): T[] {
// 	// 1. 使用泛型约束确保类型安全
// 	if (!Array.isArray(array)) throw new Error("第一个参数必须是数组");
// 	if (typeof childrensField !== "string")
// 		throw new Error("子字段名必须是字符串");
// 	if (typeof callback !== "function") throw new Error("回调必须是函数");

// 	// 2. 使用尾递归优化（TCO-friendly）
// 	const processItem = (item: T): T => {
// 		const newItem = { ...item }; // 浅拷贝当前项
// 		callback(newItem, -1, []); // 默认参数占位

// 		if (Array.isArray(newItem[childrensField])) {
// 			newItem[childrensField] = deepProcessArray(
// 				newItem[childrensField],
// 				childrensField,
// 				callback
// 			);
// 		}
// 		return newItem;
// 	};

// 	return array.map((item, index, parent) => {
// 		const newItem = processItem(item);
// 		callback(newItem, index, parent); // 实际调用时传入正确上下文
// 		return newItem;
// 	});
// }
export default function deepProcessArray<T extends Record<string, any>>(
	node: T,
	childrensField: string,
	callback: (item: T) => void
) {
	callback(node);
	if (node[childrensField] && node[childrensField].length > 0) {
		node[childrensField].forEach((item: T) => {
			deepProcessArray(item, childrensField, callback);
		});
	}
	return node;
}
