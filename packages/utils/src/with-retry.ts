/* * */

export interface RetryOptions {
	baseDelayMs?: number
	maxAttempts?: number
	maxDelayMs?: number
}

/* * */

/**
 * Executes an asynchronous function with retry logic.
 *
 * Retries the provided async function up to the specified number of attempts, waiting with exponential backoff between each attempt.
 *
 * @template T The type of the resolved value.
 * @param fn - The asynchronous function to execute.
 * @param options - Retry options.
 *   @param options.baseDelayMs - Initial delay in milliseconds before the first retry (default: 100).
 *   @param options.maxAttempts - Maximum number of attempts (default: 3).
 *   @param options.maxDelayMs  - Maximum delay between retries in milliseconds (default: 2000).
 * @returns A Promise resolving to the function's return value.
 * @throws The last error thrown by the retried function after exhausting all attempts.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = { baseDelayMs: 100, maxAttempts: 3, maxDelayMs: 2000 }): Promise<T> {
	//
	// Last error.
	let lastError: unknown;

	//
	// Helper function to sleep for the given delay.
	const sleep = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));

	//
	// Main retry loop.

	for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			if (attempt >= options.maxAttempts) throw error;
			const delay = Math.min(options.maxDelayMs, options.baseDelayMs * 2 ** (attempt - 1));
			await sleep(delay);
		}
	}

	throw lastError;
}
