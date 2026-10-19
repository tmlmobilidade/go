/**
 * Logs a termination/done message surrounded by separator lines for emphasis.
 *
 * @param message - The message to highlight as terminated/completed.
 */
export function terminate(message: string): void {
	console.log();
	console.log('-'.repeat(message.length));
	console.log(message);
	console.log('-'.repeat(message.length));
	console.log();
}
