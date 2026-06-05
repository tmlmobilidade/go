/* * */

/**
 * The GTFS Binary type represents a boolean value
 * in the GTFS (General Transit Feed Specification) format.
 * GTFS uses 0 and 1 to indicate either TRUE / FALSE or fields
 * with binary states, such as direction or availability.
 */
export type GTFS_Binary = 0 | 1;

/**
 * Validates and transforms a value into a GTFS Binary type.
 * It accepts numeric or string representations of boolean values.
 * If the value is not provided, it defaults to 0 (NO).
 * @param value The value to validate and transform.
 * @returns A GTFS_Binary value (0 or 1).
 * @throws Error if the value is not a valid GTFS boolean representation.
 */
export function validateGtfsBinary(value?: number | string): GTFS_Binary {
	// Return NO if the value is not provided or is null/undefined
	if (value === undefined || value === null || value === '') {
		return 0;
	}
	// Handle numeric and string representations of GTFS boolean values
	if (typeof value === 'number') {
		if (value === 0) return 0;
		if (value === 1) return 1;
	}
	// Handle string representations of GTFS boolean values
	if (typeof value === 'string') {
		if (value === '0') return 0;
		if (value === '1') return 1;
	}
	// If the value does not match any known GTFS boolean representation, throw an error
	throw new Error(`Invalid GTFS Binary value: "${value}". It must be 0 or 1.`);
}

/* * */

/**
 * The GTFS Ternary type represents a value that can be one of three states:
 * 0 (NOT_SPECIFIED), 1 (YES), or 2 (NO). This is used in GTFS to indicate
 * optional or unknown states for certain fields, such as whether a service
 * is enabled, disabled, or unknown.
 */
export type GTFS_Ternary = 0 | 1 | 2;

/**
 * Validates and transforms a value into a GTFS Ternary type.
 * It accepts numeric or string representations of ternary values.
 * If the value is not provided, it defaults to 0 (NOT_SPECIFIED).
 * @param value The value to validate and transform.
 * @returns A GTFS_Ternary value (0, 1, or 2).
 * @throws Error if the value is not a valid GTFS ternary representation.
 */
export function validateGtfsTernary(value?: number | string): GTFS_Ternary {
	// Return NOT_SPECIFIED if the value is not provided or is null/undefined
	if (value === undefined || value === null || value === '') {
		return 0;
	}
	// Handle numeric and string representations of GTFS boolean values
	if (typeof value === 'number') {
		if (value === 0) return 0;
		if (value === 1) return 1;
		if (value === 2) return 2;
	}
	// Handle string representations of GTFS boolean values
	if (typeof value === 'string') {
		if (value === '0') return 0;
		if (value === '1') return 1;
		if (value === '2') return 2;
	}
	// If the value does not match any known GTFS boolean representation, throw an error
	throw new Error(`Invalid GTFS Ternary value: "${value}". It must be 0, 1, or 2.`);
}

/* * */

/**
 * Represents the type of pickup or drop-off allowed for a transit service.
 * This is used in GTFS to indicate how passengers can be picked up or dropped off
 * at stops along a route.
 */
export type GTFS_PickupDropoffType =
  | 0 // Continuous pickup or drop-off allowed
  | 1 // Regular pickup or drop-off where the vehicle stops at predefined locations
  | 2 // Must contact transit agency to arrange pickup or drop-off
  | 3; // Must contact driver to arrange pickup or drop-off

/**
 * Validates and transforms a value into a PickupDropoffType.
 * It accepts numeric or string representations of pickup/drop-off types.
 * If the value is not provided, it defaults to 1 (Regular pickup or drop-off).
 * @param value The value to validate and transform.
 * @returns A PickupDropoffType value (0, 1, 2, or 3).
 * @throws Error if the value is not a valid PickupDropoffType representation.
 */
export function validateGtfsPickupDropoffType(value?: number | string): GTFS_PickupDropoffType {
	// Default to regular pickup or drop-off
	if (value === undefined || value === null || value === '') return 1;
	// Handle numeric and string representations of PickupDropoffType values
	if (typeof value === 'number') {
		if (value >= 0 && value <= 3) return value as GTFS_PickupDropoffType;
	} else if (typeof value === 'string') {
		const numValue = parseInt(value, 10);
		if (!isNaN(numValue) && numValue >= 0 && numValue <= 3) return numValue as GTFS_PickupDropoffType;
	}
	// If the value does not match any known PickupDropoffType, throw an error
	throw new Error(`Invalid PickupDropoffType value: "${value}". It must be a number between 0 and 3.`);
}

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
