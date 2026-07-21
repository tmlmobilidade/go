/**
 * Logs a divider line to visually separate sections in the console output.
 *
 * If a message is provided, it will be placed after an initial hyphen and padded with additional hyphens up to `size`.
 * For example: divider("Section", 20) will print something like:
 *
 *
 * - Section -----------
 *
 * @param message Optional message to display within the divider.
 * @param size Total length of the divider line. Defaults to 75.
 */
export function divider(message?: string, size = 75): void {
	console.log();
	if (message) {
		// Calculate the available space for hyphens after the message and account for hyphens and spaces
		const hyphenCount = size - 2 - message.length;
		console.log(`- ${message} ${'-'.repeat(hyphenCount < 1 ? 1 : hyphenCount)}`);
	} else {
		console.log('-'.repeat(size));
	}
	console.log();
}
