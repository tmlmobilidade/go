/* * */

/**
 * Normalize a character to remove diacritics, uppercase, and only allow spaces, letters, numbers, dashes and parentheses
 * @param char Character to normalize
 * @returns Normalized character
 */
export function normalizeChar(char: string): string {
	return char
		?.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toUpperCase()
		.replace(/[^A-Z0-9\s().:|-]/g, '') ?? ' ';
}
