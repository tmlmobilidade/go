/**
 * Logs a visually prominent title message to stdout, wrapped with spacing.
 *
 * @param message - The title or label to display.
 */
export function title(message: string): void {
	console.log();
	console.log(`▶︎ ${message}`);
	console.log();
}
