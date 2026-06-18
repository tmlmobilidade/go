/**
 * Logs a visually prominent title message to stdout, wrapped with spacing.
 *
 * Prints a blank line, then a right-pointing triangle (▶︎) followed by the provided message,
 * then another blank line. Use to mark the beginning of a new section or highlight a stage in logs.
 *
 * Usage:
 *   title('Deploying Database…');
 *   title('Step 2: Data Import');
 *
 * @param message - string — The title or label to display.
 */
export function title(message: string): void {
	console.log();
	console.log(`▶︎ ${message}`);
	console.log();
}
