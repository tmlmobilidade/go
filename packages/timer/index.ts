/**
 * Timer class for tracking elapsed time.
 * Provides methods to get formatted time strings and raw time values.
 */
class TimerClass {
	private startTime: number;

	constructor() {
		this.startTime = Date.now();
	}

	/**
	 * Gets the elapsed time as a formatted string.
	 * @param reset - If true, resets the timer after getting the elapsed time
	 * @returns Formatted string (e.g., "1h 2m 3s 456ms" or "0ms")
	 */
	get(reset = false): string {
		const elapsedTime = Date.now() - this.startTime;
		const result = this.formatElapsedTime(elapsedTime);

		if (reset) {
			this.reset();
		}

		return result;
	}

	/**
	 * Gets the elapsed time in milliseconds.
	 * @param reset - If true, resets the timer after getting the elapsed time
	 * @returns Elapsed time in milliseconds
	 */
	getMs(reset = false): number {
		const elapsedTime = Date.now() - this.startTime;

		if (reset) {
			this.reset();
		}

		return elapsedTime;
	}

	/**
	 * Gets the elapsed time in seconds.
	 * @param reset - If true, resets the timer after getting the elapsed time
	 * @returns Elapsed time in seconds (with decimal precision)
	 */
	getSeconds(reset = false): number {
		const elapsedTime = Date.now() - this.startTime;
		const seconds = elapsedTime / 1000;

		if (reset) {
			this.reset();
		}

		return seconds;
	}

	/**
	 * Resets the timer to the current time.
	 */
	reset(): void {
		this.startTime = Date.now();
	}

	/**
	 * Formats elapsed time in milliseconds to a human-readable string.
	 * @param elapsedTime - Time in milliseconds
	 * @returns Formatted string (e.g., "1h 2m 3s 456ms" or "0ms")
	 */
	private formatElapsedTime(elapsedTime: number): string {
		// Ensure non-negative time
		const time = Math.max(0, elapsedTime);

		const hours = Math.floor(time / (1000 * 60 * 60));
		const minutes = Math.floor(time / (1000 * 60)) % 60;
		const seconds = Math.floor(time / 1000) % 60;
		const milliseconds = time % 1000;

		const parts: string[] = [];

		if (hours > 0) parts.push(`${hours}h`);
		if (minutes > 0) parts.push(`${minutes}m`);
		if (seconds > 0) parts.push(`${seconds}s`);
		if (milliseconds > 0 || parts.length === 0) {
			parts.push(`${milliseconds}ms`);
		}

		return parts.join(' ');
	}
}

/**
 * Singleton Timer instance for tracking time.
 * @example
 * ```ts
 * Timer.reset();
 * // ... do work ...
 * console.log(Timer.get()); // "1s 234ms"
 * ```
 */
export { TimerClass as Timer };
