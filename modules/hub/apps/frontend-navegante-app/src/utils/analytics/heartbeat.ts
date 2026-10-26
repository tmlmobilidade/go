interface AnalyticsHeartbeatRuntime {
	addVisibilityChangeListener: (listener: () => void) => void
	clearInterval: (intervalId: number) => void
	isVisible: () => boolean
	removeVisibilityChangeListener: (listener: () => void) => void
	setInterval: (callback: () => void, intervalMs: number) => number
}

/* * */

export function startAnalyticsHeartbeat(
	runtime: AnalyticsHeartbeatRuntime,
	onPing: () => void,
	intervalMs = 60_000,
): () => void {
	let intervalId: number | undefined;

	const stopInterval = () => {
		if (intervalId === undefined) return;
		runtime.clearInterval(intervalId);
		intervalId = undefined;
	};

	const startInterval = () => {
		if (!runtime.isVisible() || intervalId !== undefined) return;
		onPing();
		intervalId = runtime.setInterval(onPing, intervalMs);
	};

	const handleVisibilityChange = () => {
		if (runtime.isVisible()) {
			startInterval();
			return;
		}
		stopInterval();
	};

	runtime.addVisibilityChangeListener(handleVisibilityChange);
	startInterval();

	return () => {
		stopInterval();
		runtime.removeVisibilityChangeListener(handleVisibilityChange);
	};
}
