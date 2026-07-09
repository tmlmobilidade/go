/**
 * Logs an initialization block with the current ISO timestamp.
 *
 * This helper prints a visually distinct divider and the current datetime
 * to stdout, marking the start or (re)initialization of logs.
 *
 * Output format:
 *   (blank line)
 *   --------------------... (matches timestamp width)
 *   2023-01-01T12:34:56.789Z
 *   --------------------... (matches timestamp width)
 *   (blank line)
 *
 * Useful for making log session starts obvious in output.
 */
export function init() {
	const currentDate = new Date().toISOString();
	console.log();
	console.log('-'.repeat(currentDate.length));
	console.log(currentDate);
	console.log('-'.repeat(currentDate.length));
	console.log();
}
