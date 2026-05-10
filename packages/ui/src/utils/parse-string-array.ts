'use client';

import { createParser } from 'nuqs';

/* * */

const parseFn = (queryValue: string) => {
	// Skip if the query value is invalid.
	if (!queryValue || typeof queryValue !== 'string') return null;
	// Handle the special case where the query value is 'none'.
	if (queryValue === 'none') return [];
	// Split the query value by commas, trim each item,
	// filter out empty items, and return a sorted unique string.
	return queryValue
		.split(',')
		.map(item => item.trim())
		.filter(item => item !== 'none' && item !== '');
};

/* * */

const serializeFn = (value: string[]) => {
	// Skip if the value is not a valid array.
	if (!Array.isArray(value)) return null;
	// Handle the special case where the value is empty.
	if (value.length === 0) return 'none';
	// Return a sorted unique string of values.
	// This ensures that the values are unique and sorted,
	// which is essential for consistent filtering.
	return Array
		.from(new Set(value))
		.sort()
		.map(item => item.trim())
		.join(',');
};

/* * */

const eqFn = (a: string[], b: string[]) => {
	// Skip if the values are not valid arrays.
	if (!Array.isArray(a) || !Array.isArray(b)) return null;
	// Check if the arrays are equal by quickly comparing their lengths
	if (a.length !== b.length) return false;
	// If the length is the same ensure they're equal by also
	// checking if every item in one array is included in the other.
	return a.every(item => b.includes(item)) && b.every(item => a.includes(item));
};

/**
 * NUQS parser for an array of strings.
 * Handles parsing, serialization, and equality checking for filters
 * that accept multiple string values.
 */
export const parseAsArrayOfStrings = createParser({ eq: eqFn, parse: parseFn, serialize: serializeFn });
