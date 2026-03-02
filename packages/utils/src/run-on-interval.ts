/**
 * Runs a function immediately, then repeatedly on a fixed interval.
 * Errors are caught and logged per-invocation — they do not halt scheduling.
 * Each invocation is fire-and-forget after the first awaited call.
 */
export function runOnInterval(fn: () => Promise<void>, intervalMs: number): () => void {
	let intervalId: null | ReturnType<typeof setInterval> = null;

	const execute = () =>
		fn().catch((error) => {
			console.error('[runOnInterval] Unhandled error in scheduled function:', error);
		});

	// Await the first run before starting the interval so startup errors surface
	void execute().then(() => {
		intervalId = setInterval(() => void execute(), intervalMs);
	});

	// Return a cleanup function to cancel scheduling
	return () => {
		if (intervalId !== null) clearInterval(intervalId);
	};
}
