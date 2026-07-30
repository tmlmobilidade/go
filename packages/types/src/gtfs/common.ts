/* * */

/**
 * Describes if the stop has a "has" field.
 * 0 - Not Applicable for this stop
 * 1 - Stop has no "has" field
 * 2 - Has "has" field but is in bad condition
 * 3 - Has "has" field and is in good condition
 */
export type GTFS_HasField = 0 | 1 | 2 | 3;

/**
 * Validates and transforms a value into a GTFS_HasField type.
 * It accepts numeric or string representations of "has" field values.
 * If the value is not provided, it defaults to 0 (Not Applicable for this stop).
 * @param value The value to validate and transform.
 * @returns A GTFS_HasField value (0, 1, 2, or 3).
 * @throws Error if the value is not a valid GTFS_HasField representation.
 */
export function validateGtfsHasField(value?: number | string): GTFS_HasField {
	// Return NOT_APPLICABLE if the value is not provided or is null/undefined
	if (value === undefined || value === null || value === '') return 0;
	// Handle numeric and string representations of GTFS_HasField values
	if (typeof value === 'number') {
		if (value === 0) return 0;
		if (value === 1) return 1;
		if (value === 2) return 2;
		if (value === 3) return 3;
	}
	// Handle string representations of GTFS_HasField values
	if (typeof value === 'string') {
		if (value === '0') return 0;
		if (value === '1') return 1;
		if (value === '2') return 2;
		if (value === '3') return 3;
	}
	// If the value does not match any known GTFS_HasField representation, throw an error
	throw new Error(`Invalid GTFS_HasField value: "${value}". It must be a number between 0 and 3.`);
}
