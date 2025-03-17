// utils/TickManager.ts
type TickCallback = () => void;

class TickManager {
	private static instance: TickManager;

	private fps = 60;
	private fpsEstimateInterval = 300000; // Recalculate every 5 minutes

	private frameCounter = 0;
	private frameId: null | number = null;

	private framesPerTick = 1;
	private lastFpsEstimateTime = 0;

	private targetFPS = 60;
	private tickCallbacks = new Set<TickCallback>();

	private constructor() {
		this.start();
	}

	// Singleton getter
	public static getInstance(): TickManager {
		if (!TickManager.instance) {
			TickManager.instance = new TickManager();
		}
		return TickManager.instance;
	}

	public stop() {
		if (this.frameId !== null) {
			cancelAnimationFrame(this.frameId);
			this.frameId = null;
		}
		this.tickCallbacks.clear();
	}

	public subscribe(callback: TickCallback): () => void {
		this.tickCallbacks.add(callback);
		return () => {
			this.tickCallbacks.delete(callback);
		};
	}

	private estimateFPS(): Promise<number> {
		return new Promise((resolve) => {
			if (typeof requestAnimationFrame !== 'function') resolve(60);
			let frames = 0;
			const start = performance.now();
			const sampleDuration = 1000; // 1 second sample

			const measure = (now: number) => {
				frames++;
				if (now - start >= sampleDuration) {
					const fps = (frames * 1000) / (now - start);
					console.log('Estimated FPS:', Math.round(fps));
					resolve(Math.round(fps));
				}
				else {
					requestAnimationFrame(measure);
				}
			};

			requestAnimationFrame(measure);
		});
	}

	private smoothFPSUpdate() {
		// Damped average: slowly adjust actual FPS toward target
		this.fps = Math.round(this.fps * 0.8 + this.targetFPS * 0.2);
		this.updateFramesPerTick();
	}

	private start() {
		this.estimateFPS().then((fps) => {
			this.fps = fps;
			this.targetFPS = fps;
			this.updateFramesPerTick();
			this.startLoop();
		});
	}

	private startLoop() {
		if (typeof requestAnimationFrame !== 'function') return;
		const loop = () => {
			this.frameCounter++;

			if (this.frameCounter >= this.framesPerTick) {
				this.frameCounter = 0;
				this.tickCallbacks.forEach(cb => cb());
			}

			// Check if it’s time to re-estimate FPS
			const now = Date.now();
			if (now - this.lastFpsEstimateTime >= this.fpsEstimateInterval) {
				this.lastFpsEstimateTime = now;
				this.estimateFPS().then((fps) => {
					this.targetFPS = fps;
					this.smoothFPSUpdate();
				});
			}

			this.frameId = requestAnimationFrame(loop);
		};

		this.frameId = requestAnimationFrame(loop);
	}

	private updateFramesPerTick() {
		// Assuming you want 10 ticks/sec
		const desiredTickRate = 10;
		this.framesPerTick = Math.max(1, Math.round(this.targetFPS / desiredTickRate));
		console.log('Frames per tick:', this.framesPerTick);
	}
}

export const GlobalTickManager = TickManager.getInstance();
