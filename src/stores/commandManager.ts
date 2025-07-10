import type { FormNode, FormNodeCmpType } from "@/types/index";
import { defineStore } from "pinia";
import { ref } from "vue";
type Command = {
	execute: () => void;
	undo: () => void;
};

class CommandManager {
	private undoStack: Command[] = []; // 处理撤销逻辑
	private redoStack: Command[] = []; // 处理重做逻辑

	// 执行命令并加入撤销栈
	execute(command: Command) {
		command.execute(); // 执行命令
		this.undoStack.push(command); // 加入撤销栈
		this.redoStack = []; // 清空重做栈
		// console.log(this.undoStack);
	}

	// 执行撤销命令
	undo() {
		if (this.undoStack.length > 0) {
			const command = this.undoStack.pop() as Command;
			command.undo();
			this.redoStack.push(command); // 加入重做栈
		}
	}

	redo() {
		if (this.redoStack.length > 0) {
			const command = this.redoStack.pop() as Command;
			command.execute();
			this.undoStack.push(command); // 加入撤销栈
		}
	}

	canUndo() {
		return this.undoStack.length > 0;
	}

	canRedo() {
		return this.redoStack.length > 0;
	}
}
export const useCommandManager = defineStore("commandManager", () => {
	const commandManager = ref(new CommandManager());

	// 修改节点参数

	return {
		commandManager,
	};
});

export class AddNodeCommand implements Command {
	private nodes: FormNode[];
	private formNode: FormNode;
	private anchorIndex: number;

	constructor(nodes: FormNode[], formNode: FormNode, anchorIndex: number = -1) {
		this.nodes = nodes;
		this.formNode = formNode;
		this.anchorIndex = anchorIndex;
	}

	execute() {
		if (this.anchorIndex === -1) {
			this.nodes.push(this.formNode);
		} else {
			this.nodes.splice(this.anchorIndex, 0, this.formNode);
		}
	}
	undo() {
		this.nodes.splice(this.anchorIndex, 1); // 删除节点
	}
}
export class DeleteNodeCommand implements Command {
	private nodes: FormNode[];
	private formNode: FormNode | null = null;
	private anchorIndex: number;

	constructor(nodes: FormNode[], anchorIndex: number = -1) {
		this.nodes = nodes;
		this.anchorIndex = anchorIndex;
	}
	execute() {
		this.formNode = this.nodes.splice(this.anchorIndex, 1)[0]; // 删除节点
	}
	undo() {
		if (this.formNode !== null) {
			this.nodes.splice(this.anchorIndex, 0, this.formNode);
		}
	}
}

export class CompositeNodeCommand implements Command {
	private commands: Command[] = [];

	constructor(...args: Command[]) {
		this.commands = args;
	}
	execute() {
		this.commands.forEach((command) => {
			command.execute();
		});
	}
	undo() {
		for (let i = this.commands.length - 1; i >= 0; i--) {
			this.commands[i].undo();
		}
	}
}

export class ModifyNodeCommand implements Command {
	private obj: Record<string, any>;
	private prop: string;
	private newVal: any;
	private oldVal: any;

	constructor(obj: Record<string, any>, prop: string, newVal: any) {
		this.obj = obj;
		this.prop = prop;
		this.newVal = newVal;
		this.oldVal = obj[prop];
	}
	execute() {
		// 修改新值
		this.obj[this.prop] = this.newVal;
		console.log(this.obj[this.prop]);
	}
	undo() {
		this.obj[this.prop] = this.oldVal; // 恢复旧值
		console.log(this.obj[this.prop]);
	}
}
