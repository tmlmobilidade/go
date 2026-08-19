/**
 * Checks if the value is a record.
 * @param value - The value to check.
 * @returns True if the value is a record, false otherwise.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
	//

	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
