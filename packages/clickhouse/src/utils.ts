/**
 * Checks if a string is a safe identifier.
 * This function is used to prevent SQL injection attacks.
 * @param str The string to check if it is a safe identifier.
 * @returns True if the string is a safe identifier, false otherwise.
 */
export function isSafeIdentifier(str: string) {
	return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(str);
}
