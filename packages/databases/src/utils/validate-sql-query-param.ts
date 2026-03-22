/* * */

export const safeQueryParamKey = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Validates that a given string is a safe SQL query parameter key,
 * which must start with a letter or underscore and can only contain letters,
 * numbers, or underscores. This is important to prevent SQL injection vulnerabilities
 * when using dynamic query parameters.
 * @param key The query parameter key to validate.
 * @throws Will throw an error if the key is invalid.
 * @returns The validated query parameter key.
 */
export function validateSqlQueryParam(key: string): string {
	if (!safeQueryParamKey.test(key)) {
		throw new Error(`Invalid query parameter key: ${key}. Keys must start with a letter or underscore, followed by letters, numbers, or underscores.`);
	}
	return key;
}
