/* * */

import { setPlanStatus } from './set-plan-status.js';

interface StartPlanHeartbeatReturnType {
	stop: () => void
}

/**
 * Starts a heartbeat to indicate the plan is still being processed.
 * @param planId - The ID of the plan to heartbeat.
 * @returns An object with a `stop` method to stop the heartbeat.
 */
export function startPlanHeartbeat(planId: string): StartPlanHeartbeatReturnType {
	//

	let isStopped = false;

	let timer: NodeJS.Timeout | undefined;

	const tick = async () => {
		// Skip if the heartbeat is stopped.
		if (isStopped) return;
		// Set the plan status to processing.
		await setPlanStatus(planId, 'processing');
		// Schedule the next heartbeat.
		if (!isStopped) timer = setTimeout(tick, 30_000);
	};

	//
	// Start the heartbeat.

	void tick();

	//
	// Return the stop function.

	return {
		stop: () => {
			isStopped = true;
			if (timer) clearTimeout(timer);
		},
	};
}
