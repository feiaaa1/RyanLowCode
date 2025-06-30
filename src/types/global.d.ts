// 节点属性配置面板 表单项描述对象
type ConfigPanelItem = {
	prop: string; // 绑定的属性名
	defaultValue: any; // 默认值
	label: string; // 标签
	type: string; // 表单类型
	[key: string]: any;
};

// 节点属性配置面板描述对象
type ConfigPanelList = Record<string, ConfigPanelItem[]>;

// 表单节点模板类型
type FormNodeTemplate = {
	nodeType: string; // 节点类型
	name: string;
	type: string;
	configs: Record<string, any>;
	configPanelList: ConfigPanelList;
};

//表单节点类型
type FormNode = FormNodeTemplate & {
	id: string;
};

type FormNodeCmpType = {
	nodeType: string; // 节点类型
	name: string;
	type: FormComponent;
	configs: Record<string, any>;
	configPanelList: ConfigPanelList;
	id: string;
};

// 表单组件类型
import { type DefineComponent } from "vue";
type FormComponent = DefineComponent & {
	type: string; // 组件类型，用于节点树
	configPanelList: ConfigPanelList; // 组件属性面板
	nodeName: string; // 节点名称
	nodeType: string; // 节点类型
};
