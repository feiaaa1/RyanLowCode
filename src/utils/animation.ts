interface AnimationState {
	target: HTMLElement;
	rect: DOMRect;
}

interface AnimationOptions {
	duration: number;
	easing?: string;
}

interface Rect {
	top: number;
	left: number;
	bottom: number;
	right: number;
	width: number;
	height: number;
}

export class AnimationManager {
	private animationStates: AnimationState[] = [];
	private animationCallbackId: number | null = null;
	private options: AnimationOptions;

	constructor(options: AnimationOptions) {
		this.options = options;
	}

	/**
	 * 捕获所有元素的当前动画状态
	 * @param container 容器元素
	 * @param excludeHidden 是否排除隐藏元素
	 */
	captureAnimationState(
		container: HTMLElement,
		excludeHidden: boolean = true
	): void {
		this.animationStates = [];
		if (!this.options.duration) return;

		const children = Array.from(container.children) as HTMLElement[];

		children.forEach((child) => {
			if (
				(excludeHidden && getComputedStyle(child).display === "none") ||
				child.classList.contains("ghost")
			) {
				return;
			}

			const rect = this.getRect(child);
			this.animationStates.push({
				target: child,
				rect,
			});

			const fromRect = { ...rect };

			// 如果元素正在动画中，补偿当前动画位移
			if ((child as any).animationDuration) {
				const matrix = this.getMatrix(child, true);
				if (matrix) {
					fromRect.top -= matrix.f;
					fromRect.left -= matrix.e;
				}
			}

			(child as any).fromRect = fromRect;
		});
	}

	/**
	 * 执行所有动画
	 * @param callback 动画完成后的回调
	 */
	async animateAll() {
		return new Promise<void>((resolve) => {
			if (!this.options.duration) {
				if (this.animationCallbackId) {
					clearTimeout(this.animationCallbackId);
					this.animationCallbackId = null;
				}
				resolve();
				return;
			}

			let isAnimating = false;
			let maxDuration = 0;

			this.animationStates.forEach((state) => {
				const target = state.target;
				const fromRect = (target as any).fromRect as Rect;
				const toRect = this.getRect(target);
				const prevFromRect = (target as any).prevFromRect as Rect | undefined;
				const prevToRect = (target as any).prevToRect as Rect | undefined;
				const currentRect = state.rect;
				const matrix = this.getMatrix(target, true);

				// 补偿当前动画位移
				if (matrix) {
					toRect.top -= matrix.f;
					toRect.left -= matrix.e;
				}

				(target as any).toRect = toRect;

				let duration = 0;

				// 如果元素已经在动画中，计算剩余动画时间
				if ((target as any).animationDuration) {
					if (
						prevFromRect &&
						this.isRectEqual(prevFromRect, toRect) &&
						!this.isRectEqual(fromRect, toRect) &&
						this.isOnSameAxis(currentRect, toRect, fromRect)
					) {
						duration = this.calculateRemainingTime(
							currentRect,
							prevFromRect,
							prevToRect || toRect
						);
					}
				}

				// 如果需要动画
				if (!this.isRectEqual(toRect, fromRect)) {
					(target as any).prevFromRect = fromRect;
					(target as any).prevToRect = toRect;

					if (!duration) {
						duration = this.options.duration;
					}

					this.animateElement(target, currentRect, toRect, duration);
					isAnimating = true;
					maxDuration = Math.max(maxDuration, duration);

					// 设置动画重置定时器
					clearTimeout((target as any).animationResetTimer);
					(target as any).animationResetTimer = setTimeout(() => {
						(target as any).animationDuration = null;
						(target as any).prevFromRect = null;
						(target as any).fromRect = null;
						(target as any).prevToRect = null;
					}, duration);

					(target as any).animationDuration = duration;
				}
			});

			// 清除之前的回调
			if (this.animationCallbackId) {
				clearTimeout(this.animationCallbackId);
			}

			if (!isAnimating) {
				resolve();
			} else {
				this.animationCallbackId = window.setTimeout(() => {
					resolve();
				}, maxDuration);
			}

			this.animationStates = [];
		});
	}

	/**
	 * 执行单个元素的动画
	 */
	private animateElement(
		target: HTMLElement,
		currentRect: Rect,
		toRect: Rect,
		duration: number
	): void {
		// 重置过渡和变换
		target.style.transition = "";
		target.style.transform = "";

		const containerMatrix = this.getMatrix(target.parentElement || undefined);
		const scaleX = containerMatrix?.a || 1;
		const scaleY = containerMatrix?.d || 1;

		const translateX = (currentRect.left - toRect.left) / scaleX;
		const translateY = (currentRect.top - toRect.top) / scaleY;

		// 设置初始位置
		target.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;

		// 强制重绘
		this.forceRepaint(target);

		// 开始动画
		target.style.transition = `transform ${duration}ms${
			this.options.easing ? ` ${this.options.easing}` : ""
		}`;
		target.style.transform = "translate3d(0, 0, 0)";

		// 清除之前的动画定时器
		if ((target as any).animationTimer) {
			clearTimeout((target as any).animationTimer);
		}

		// 设置动画结束后的清理
		(target as any).animationTimer = setTimeout(() => {
			target.style.transition = "";
			target.style.transform = "";
			(target as any).animationTimer = null;
		}, duration);
	}

	/**
	 * 强制浏览器重绘
	 */
	private forceRepaint(element: HTMLElement): void {
		// eslint-disable-next-line no-unused-expressions
		element.offsetHeight;
	}

	/**
	 * 获取元素的变换矩阵
	 */
	private getMatrix(
		element?: HTMLElement,
		selfOnly?: boolean
	): DOMMatrix | null {
		if (!element) return null;

		let transformValue = "";
		let currentElement: HTMLElement | null = element;

		do {
			const transform = getComputedStyle(currentElement).transform;
			if (transform && transform !== "none") {
				transformValue = `${transform} ${transformValue}`;
			}
		} while (!selfOnly && (currentElement = currentElement.parentElement));

		if (!transformValue) return null;

		return new DOMMatrix(transformValue);
	}

	/**
	 * 获取元素的位置和尺寸信息
	 */
	private getRect(element: HTMLElement | Window): Rect {
		if (element === window) {
			return {
				top: 0,
				left: 0,
				bottom: window.innerHeight,
				right: window.innerWidth,
				width: window.innerWidth,
				height: window.innerHeight,
			};
		}

		const rect = element.getBoundingClientRect();
		return {
			top: rect.top,
			left: rect.left,
			bottom: rect.bottom,
			right: rect.right,
			width: rect.width,
			height: rect.height,
		};
	}

	/**
	 * 比较两个矩形是否相等
	 */
	private isRectEqual(rect1: Rect, rect2: Rect): boolean {
		return (
			Math.round(rect1.top) === Math.round(rect2.top) &&
			Math.round(rect1.left) === Math.round(rect2.left) &&
			Math.round(rect1.width) === Math.round(rect2.width) &&
			Math.round(rect1.height) === Math.round(rect2.height)
		);
	}

	/**
	 * 检查三个点是否在同一条直线上
	 */
	private isOnSameAxis(current: Rect, to: Rect, from: Rect): boolean {
		return (
			(current.top - to.top) / (current.left - to.left) ===
			(from.top - to.top) / (from.left - to.left)
		);
	}

	/**
	 * 计算剩余动画时间
	 */
	private calculateRemainingTime(current: Rect, from: Rect, to: Rect): number {
		const totalDistance = Math.sqrt(
			Math.pow(from.top - to.top, 2) + Math.pow(from.left - to.left, 2)
		);
		const remainingDistance = Math.sqrt(
			Math.pow(current.top - to.top, 2) + Math.pow(current.left - to.left, 2)
		);

		return (remainingDistance / totalDistance) * this.options.duration;
	}
}
