// TickManager.ts
type TickCallback = () => void;

class TickManager {
	public static get instance(): TickManager {
		if (!this._instance) this._instance = new TickManager();
		return this._instance;
	}

	private static _instance: TickManager;
	private frameId: null | number = null;
	private lastTime = 0;
	private loopStarted = false;
	private subscribers = new Set<TickCallback>();

	private tickInterval = 100; // ms

	public stopLoop() {
		if (this.frameId) cancelAnimationFrame(this.frameId);
	}

	public subscribe(callback: TickCallback) {
		this.subscribers.add(callback);
		if (typeof window !== 'undefined' && !this.loopStarted) {
			this.loopStarted = true;
			this.lastTime = performance.now();
			this.startLoop();
		}
	}

	public unsubscribe(callback: TickCallback) {
		this.subscribers.delete(callback);
	}

	private startLoop() {
		const loop = (time: number) => {
			if (time - this.lastTime >= this.tickInterval) {
				this.lastTime = time;
				this.subscribers.forEach(cb => cb());
			}
			this.frameId = requestAnimationFrame(loop);
		};
		this.frameId = requestAnimationFrame(loop);
	}
}

export const GlobalTickManager = TickManager.instance;
