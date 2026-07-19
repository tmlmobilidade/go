/* * */

export const safeSqlParamRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Validates that a given string is a safe SQL query parameter key,
 * which must start with a letter or underscore and can only contain letters,
 * numbers, or underscores. This is important to prevent SQL injection vulnerabilities
 * when using dynamic query parameters.
 * @param key The query parameter key to validate.
 * @param throwOnInvalid Whether to throw an error if the key is invalid (default is true).
 * @throws Will throw an error if the key is invalid and throwOnInvalid is true.
 * @returns The validated query parameter key, or false if invalid and throwOnInvalid is false.
 */
export function validateSqlParam(key: string, throwOnInvalid: boolean = true): false | string {
	// Check if the key matches the safe SQL parameter regex
	if (safeSqlParamRegex.test(key)) return key;
	// If the key is invalid, either throw an error
	// or return false based on the throwOnInvalid flag
	if (throwOnInvalid) throw new Error(`Invalid query parameter key: ${key}. Keys must start with a letter or underscore, followed by letters, numbers, or underscores.`);
	else return false;
}
