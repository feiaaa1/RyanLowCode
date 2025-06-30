export class Flip {
	private elementList: HTMLElement[]; // 监听的元素列表
	private firstMap: Map<HTMLElement, number[]> = new Map(); // 存储每个元素 DOM 变化前的位置信息
	private lastMap: Map<HTMLElement, number[]> = new Map(); // 存储每个元素 DOM 变化后的位置信息
	private duration: number; // 动画持续时间

	constructor(elmentList: HTMLElement[], duration: number = 0.15) {
		this.elementList = elmentList;
		this.duration = duration;
	}

	public first() {
		this.elementList.forEach((element: HTMLElement) => {
			this.firstMap.set(element, [
				element.getBoundingClientRect().left,
				element.getBoundingClientRect().top,
			]);
		});
	}

	public play() {
		return new Promise<void>((resolve) => {
			this.elementList.forEach((element: HTMLElement) => {
				element.style.transition = "none";
				this.lastMap.set(element, [
					element.getBoundingClientRect().left,
					element.getBoundingClientRect().top,
				]);
				const firstPos = this.firstMap.get(element);
				const lastPos = this.lastMap.get(element);
				if (firstPos !== undefined && lastPos !== undefined) {
					element.style.transform = `translate(${firstPos[0] - lastPos[0]}px, ${
						firstPos[1] - lastPos[1]
					}px)`;
				}
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						element.style.transform = "";
						element.style.transition = `transform ${this.duration}s ease-in-out`;
						setTimeout(() => {
							resolve();
						}, this.duration * 1000);
					});
				});
			});
		});
	}
}
