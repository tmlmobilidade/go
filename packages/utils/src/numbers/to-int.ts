/* * */

/**
 * Utility function to convert a number to an integer,
 * handling null and undefined values gracefully.
 * @param value The value to convert to an integer. Can be a number, null, or undefined.
 * @returns The rounded integer value if the input is a number, or null if the input is null or undefined.
 * @example
 * roundToInt(3.7); // returns 4
 * roundToInt(-2.3); // returns -2
 * roundToInt(null); // returns null
 * roundToInt(undefined); // returns null
 */
export function roundToInt(value: null | number | undefined): null | number {
	if (value === null || value === undefined) return null;
	return Math.round(value);
}

/**
 * Utility function to convert a number to an integer,
 * handling null and undefined values gracefully.
 * @param value The value to convert to an integer. Can be a number, null, or undefined.
 * @returns The truncated integer value if the input is a number, or null if the input is null or undefined.
 * @example
 * truncToInt(3.7); // returns 3
 * truncToInt(-2.3); // returns -2
 * truncToInt(null); // returns null
 * truncToInt(undefined); // returns null
 */
export function truncToInt(value: null | number | undefined): null | number {
	if (value === null || value === undefined) return null;
	return Math.trunc(value);
}
