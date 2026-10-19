/**
 * Prints the specified number of blank lines to stdout.
 *
 * This helper inserts padding in logs for readability, by emitting `lines`
 * empty lines (default 1) using console.log().
 *
 * @param lines - Number of blank lines to print (default: 1)
 *
 * Example:
 *   spacer();      // prints 1 blank line
 *   spacer(3);     // prints 3 blank lines
 */
export function spacer(lines = 1): void {
	for (let i = 0; i < lines; i++) {
		console.log();
	}
}
