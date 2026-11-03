/* * */

/**
 * Sanitizes the ride ID by replacing all forbidden
 * characters and replacing them with an underscore.
 * @param value The value to sanitize.
 * @returns The sanitized value.
 */
export function sanitizeRideId(value: string): string {
	//

	//
	// Define which characters are forbidden in the ride ID.

	const forbiddenCharacters = ['/', '.', ',', ';', '~'];

	//
	// Replace all forbidden characters with an underscore.

	const sanitizedValue = value.replace(new RegExp(`[${forbiddenCharacters.join('')}]`, 'g'), '_');

	//
	// Return the sanitized value.

	return sanitizedValue;
};
