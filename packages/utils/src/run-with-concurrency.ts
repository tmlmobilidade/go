/**
 * Run an async function over all items in the array, with a specific concurrency limit.
 *
 * @param items - The array of items to process.
 * @param concurrency - The maximum number of concurrent executions.
 * @param fn - Async function to run for each item. Receives the item and its index.
 * @returns A Promise resolving to an array of PromiseSettledResult objects, preserving input order.
 *
 * Each result is a { status, value } or { status, reason } object, as from Promise.allSettled().
 * The pool will never run more than `concurrency` functions at once.
 */
export async function runWithConcurrency<T, R>(items: T[], concurrency: number, fn: (item: T, index: number) => Promise<R>): Promise<PromiseSettledResult<R>[]> {
	if (items.length === 0) return [];

	const results: PromiseSettledResult<R>[] = new Array(items.length);
	let next = 0;

	async function worker() {
		while (next < items.length) {
			const index = next++;
			try {
				results[index] = { status: 'fulfilled', value: await fn(items[index], index) };
			} catch (reason) {
				results[index] = { reason, status: 'rejected' };
			}
		}
	}

	await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
	return results;
}
