/**
 * Logs a termination/done message surrounded by separator lines for emphasis.
 *
 * This helper prints the message with lines of dashes above and below, plus
 * leading and trailing empty lines, to visually mark the end of a process.
 *
 * - `message`: The message to highlight as terminated/completed.
 *
 * Usage:
 *   terminate('Build complete');
 *   terminate('All tasks finished successfully!');
 *
 * @param message - string — The message to log.
 */
export function terminate(message: string): void {
	console.log();
	console.log('-'.repeat(message.length));
	console.log(message);
	console.log('-'.repeat(message.length));
	console.log();
}
