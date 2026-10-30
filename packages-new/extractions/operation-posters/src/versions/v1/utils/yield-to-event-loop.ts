/* * */

const ROWS_PER_EVENT_LOOP_YIELD = 1_000;

/**
 * Allow database and SSH keepalive timers to run during large synchronous exports.
 */
export async function yieldToEventLoop(rowCount?: number): Promise<void> {
	//

	//
	// A. Skip intermediate rows when a batch counter is provided

	if (rowCount !== undefined && rowCount % ROWS_PER_EVENT_LOOP_YIELD !== 0) return;

	//
	// B. Yield so pending timers and I/O callbacks can run

	await new Promise<void>(resolve => setImmediate(resolve));
}
