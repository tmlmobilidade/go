import { type ClassValue, clsx } from 'clsx';
import { DateTime } from 'luxon';

/**
 * Utility function that merges class names together
 */
export function cn(...inputs: ClassValue[]) {
	return clsx(inputs);
}

/**
 * Utility function that returns a humanized version of a string, e.g. "camelCase" -> "Camel Case"
 */
export function humanize(value: string) {
	const str = value
		.replace(/([a-z\d])([A-Z]+)/g, '$1 $2')
		.replace(/\W|_/g, ' ')
		.trim()
		.toLowerCase();
	return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

/**
 * Truncates a string to a specified length and adds ellipsis if necessary.
 * @param {string | null} str - The string to truncate.
 * @param {number} length - The maximum length of the truncated string.
 * @returns {string | null} - The truncated string with ellipsis if it exceeds the specified length, or the original string if it does not.
 */
export const truncate = (str: null | string, length: number): null | string => {
	if (!str || str.length <= length) return str;
	return `${str.slice(0, length - 3)}...`;
};

/**
 * Capitalizes first letters of words in string.
 * @param {string} str String to be modified
 * @param {boolean=false} lower Whether all other letters should be lowercased
 * @return {string}
 * @see https://stackoverflow.com/questions/2332811/capitalize-words-in-string/7592235#7592235
 * @usage
 *   capitalize('fix this string');     // -> 'Fix This String'
 *   capitalize('javaSCrIPT');          // -> 'JavaSCrIPT'
 *   capitalize('javaSCrIPT', true);    // -> 'Javascript'
 */
export const capitalize = (str: string, lower = false) =>
	(lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match =>
		match.toUpperCase(),
	);

/**
 * Formats a date input into a human-readable string.
 * @param {number | string} input - The date input to format.
 * @returns {string} - The formatted date string.
 */
export function formatDate(input: number | string): string {
	const date = new Date(input);
	return date.toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

/**
 * Tries to parse an ISO date string into a timestamp.
 * @param {string} input - The ISO date string to parse.
 * @returns {number | undefined} - The parsed timestamp or undefined if parsing fails.
 */
export function tryParseDateToTimestamp(input: string): number | undefined {
	return DateTime.fromISO(input).toMillis();
}
