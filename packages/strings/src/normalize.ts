/**
 * Normalizes a string by converting it to lowercase, removing diacritics,
 * and replacing accented characters with their non-accented equivalents.
 * This is useful for case-insensitive and accent-insensitive string comparisons.
 * @param value The string to normalize. Ex: `Café`
 * @returns The normalized string. Ex: `cafe`
 */
export function normalizeString(value: string) {
	// Return an empty string if the value is invalid
	if (typeof value !== 'string') return '';
	// Normalize the string
	return value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');
}
