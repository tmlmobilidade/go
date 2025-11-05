/* * */

import { normalizeString } from '@tmlmobilidade/strings';

/**
 * Plain search function that checks if a given query is present
 * in any of the string values of an object. It normalizes the string values
 * to remove accents and converts them to lowercase for a case-insensitive search.
 * @param record The object to search within.
 * @param query The search query string.
 * @returns True if the query is found in any of the string values of the object, otherwise false.
 */
export function plainSearch<T>(record: T, query: string) {
	// Normalize the query string
	const normalizedQuery = normalizeString(query);
	// Convert the record to a string and get its values
	// This is necessary to ensure that we can search through all string representations of the record
	// including nested objects and arrays. This assumes that the record can be stringified.
	const stringifiedRecordValues = Object.values(String(record));
	// Check if any of the stringified values include the normalized query
	return stringifiedRecordValues.some((value) => {
		if (!value) return false;
		const normalizedValue = normalizeString(value);
		return normalizedValue
			.includes(normalizedQuery);
	});
}
