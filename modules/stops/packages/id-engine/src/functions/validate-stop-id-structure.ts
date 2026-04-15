/* * */

import { type StopId } from '@tmlmobilidade/types';

/**
 * Validates the structure of a Stop ID.
 * @param value The value to validate as a Stop ID.
 * @returns The validated Stop ID if valid, or false if invalid.
 */
export function validateStopIdStructure(value?: null | number | StopId | string): false | StopId {
	// Return false if no value is provided
	if (!value) return false;
	// Transform the value into a number if it's a string
	if (typeof value === 'string') value = parseInt(value, 10);
	// Return false if the value is not a number or is NaN
	if (typeof value !== 'number' || isNaN(value)) return false;
	// Return false if the value is outside the valid range for Stop IDs
	if (value < 100_000 || value > 999_999) return false;
	// Return the value as a Stop ID
	// if it passes all checks.
	return value as StopId;
}
