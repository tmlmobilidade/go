/* * */

import { normalizeString } from '@tmlmobilidade/strings';
import { type DotPath, getValueAtPath } from '@tmlmobilidade/utils';

/**
 * Checks if a given query is present in the value at the specified accessor path
 * of a record. It normalizes the value to remove accents and converts it to lowercase
 * for a case-insensitive search.
 * @param record The record object to search within.
 * @param accessor The accessor path to the value within the record.
 * @param query The search query string to look for in the value.
 * @returns True if the query is found in the value at the accessor path, otherwise false.
 */
export function accessorSearch<T>(record: T, accessor: DotPath<T>, query: string) {
	// Get the value at the specified accessor path
	const valueAtPath = getValueAtPath(record, accessor as any);
	// If there is no value return false
	if (!valueAtPath) return false;
	// Convert the value to a string and normalize it
	const normalizedValue = normalizeString(valueAtPath.toString());
	// Normalize the query string
	const normalizedQuery = normalizeString(query);
	// Check if the query is present in the value
	return normalizedValue.includes(normalizedQuery);
}
