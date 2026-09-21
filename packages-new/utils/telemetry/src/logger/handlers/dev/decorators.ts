/**
 * Logs a timestamped initialization block in development.
 */
export function init(): void {
	const timestamp = new Date().toISOString();
	console.log();
	console.log('-'.repeat(timestamp.length));
	console.log(timestamp);
	console.log('-'.repeat(timestamp.length));
	console.log();
}

/**
 * Logs a termination block in development.
 */
export function terminate(message: string): void {
	console.log();
	console.log('-'.repeat(message.length));
	console.log(message);
	console.log('-'.repeat(message.length));
	console.log();
}

/**
 * Logs a section title in development.
 */
export function title(message: string): void {
	console.log();
	console.log(`▶︎ ${message}`);
	console.log();
}
