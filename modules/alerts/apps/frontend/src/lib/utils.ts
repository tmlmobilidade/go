import clsx from 'clsx';
import { ClassValue } from 'clsx';
import { DateTime } from 'luxon';

export function cn(...inputs: ClassValue[]) {
	return clsx(inputs);
}

export function toggleArray<T>(array: T[], value: T) {
	if (array.includes(value)) {
		return array.filter(v => v !== value);
	}
	return [...array, value];
}

/**
 * Tries to parse an ISO date string into a timestamp.
 * @param {string} input - The ISO date string to parse.
 * @returns {number | undefined} - The parsed timestamp or undefined if parsing fails.
 */
export function tryParseDateToTimestamp(input: string): number | undefined {
	return DateTime.fromISO(input).toMillis();
}
