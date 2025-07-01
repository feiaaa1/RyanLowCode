export class Flip {
	private elementList: HTMLElement[];
	private firstMap: Map<HTMLElement, number[]> = new Map();
	private lastMap: Map<HTMLElement, number[]> = new Map();
	private duration: number;
	private animationCount: number = 0; // 跟踪进行中的动画

	constructor(elementList: HTMLElement[], duration: number = 0.15) {
		this.elementList = elementList;
		this.duration = duration;
	}

	public first() {
		this.firstMap.clear(); // 关键修复1：清空旧数据
		this.elementList.forEach((element: HTMLElement) => {
			this.firstMap.set(element, [
				element.getBoundingClientRect().left,
				element.getBoundingClientRect().top,
			]);
		});
	}

	public play() {
		return new Promise<void>((resolve) => {
			this.animationCount = this.elementList.length; // 初始化计数器

			this.elementList.forEach((element: HTMLElement) => {
				// 清除可能存在的旧动画
				if ((element as any).animationTimer) {
					clearTimeout((element as any).animationTimer);
					element.style.transition = "";
					element.style.transform = "";
				}

				// 记录新位置
				this.lastMap.set(element, [
					element.getBoundingClientRect().left,
					element.getBoundingClientRect().top,
				]);

				const firstPos = this.firstMap.get(element);
				const lastPos = this.lastMap.get(element);

				if (firstPos && lastPos) {
					// 设置初始变换
					element.style.transition = "none";
					element.style.transform = `translate(${firstPos[0] - lastPos[0]}px, ${
						firstPos[1] - lastPos[1]
					}px)`;

					// 强制重排
					element.offsetHeight;

					// 启动动画
					element.style.transition = `transform ${this.duration}s ease-in-out`;
					element.style.transform = "";

					// 单个动画结束处理
					const onComplete = () => {
						element.style.transition = "";
						element.style.transform = "";
						this.animationCount--;

						if (this.animationCount === 0) {
							resolve();
						}
					};

					// 双保险：transitionend + 超时
					element.addEventListener("transitionend", onComplete, { once: true });
					(element as any).animationTimer = setTimeout(
						onComplete,
						this.duration * 1000 + 50
					);
				}
			});
		});
	}
}
