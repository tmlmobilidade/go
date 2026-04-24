/* * */

import { type TimeSlot, TimeSlotMap } from '@tmlmobilidade/dates';

/* * */

interface RunOnIntervalOptions {

	/**
	 * Interval in milliseconds between the end of one invocation
	 * and the start of the next. The first invocation happens immediately.
	 * @required
	 */
	intervalMs: number | TimeSlot

	/**
	 * Whether to throw errors after logging them.
	 * If true, errors are logged and then re-thrown, stopping code execution.
	 * @default false
	 */
	throwOnError?: boolean

}

/**
 * Runs an asynchronous function at regular intervals, ensuring that each invocation
 * completes before the next one starts. Errors are logged and can optionally be re-thrown.
 */
export async function runOnInterval(fn: () => Promise<void>, options: RunOnIntervalOptions): Promise<void> {
	//

	//
	// Validate and determine the interval in milliseconds,
	// or throw an error if the provided interval is invalid.

	let intervalMs: number;

	if (typeof options.intervalMs === 'number') intervalMs = options.intervalMs;
	else if (!TimeSlotMap[options.intervalMs]) throw new Error(`Invalid TimeSlot: ${options.intervalMs}`);
	else intervalMs = TimeSlotMap[options.intervalMs];

	//
	// Define the runner function that will execute
	// the provided function and schedule the next execution.

	const runner = async () => {
		try {
			await fn();
		} catch (error) {
			console.error('Error in runOnInterval:', error);
			if (options.throwOnError) throw error;
		} finally {
			setTimeout(runner, intervalMs);
		}
	};

	await runner();

	//
}
