/**
 * Logs an initialization block with the current ISO timestamp.
 *
 * Output format:
 *   (blank line)
 *   --------------------... (matches timestamp width)
 *   2023-01-01T12:34:56.789Z
 *   --------------------... (matches timestamp width)
 *   (blank line)
 */
export function init(): void {
	const timestamp = new Date().toISOString();
	console.log();
	console.log('-'.repeat(timestamp.length));
	console.log(timestamp);
	console.log('-'.repeat(timestamp.length));
	console.log();
}
