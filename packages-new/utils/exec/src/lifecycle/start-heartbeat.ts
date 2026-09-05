/* * */

interface StartHeartbeatParams {
	intervalMs: number
	runFn: () => Promise<void>
}

interface StartHeartbeatReturnType {
	stop: () => void
}

/**
 * Starts a heartbeat to indicate that an operation is still being processed.
 * @param operationId The ID of the operation to heartbeat.
 * @returns An object with a `stop` method to stop the heartbeat.
 */
export function startHeartbeat({ intervalMs, runFn }: StartHeartbeatParams): StartHeartbeatReturnType {
	//

	let isStopped = false;

	let timer: NodeJS.Timeout | undefined;

	const tick = async () => {
		// Skip if the heartbeat is stopped
		if (isStopped) return;
		// Run the function
		await runFn();
		// Schedule the next heartbeat
		if (!isStopped) timer = setTimeout(tick, intervalMs);
	};

	//
	// Start the heartbeat

	void tick();

	//
	// Return the stop function

	return {
		stop: () => {
			isStopped = true;
			if (timer) clearTimeout(timer);
		},
	};
}
