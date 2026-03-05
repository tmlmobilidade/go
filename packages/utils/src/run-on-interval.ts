/**
 * Runs a function immediately, then repeatedly on a fixed interval.
 * Errors are caught and logged per-invocation — they do not halt scheduling.
 * Each invocation is fire-and-forget after the first awaited call.
 */
export async function runOnInterval(fn: () => Promise<void>, intervalMs: number): Promise<void> {
	//

	const runner = async () => {
		try {
			await fn();
		} catch (error) {
			console.error('Error in runOnInterval:', error);
		} finally {
			setTimeout(runner, intervalMs);
		}
	};

	await runner();

	//
}
