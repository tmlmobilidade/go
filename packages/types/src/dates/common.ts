/* * */

import { z } from 'zod';

/* * */

const OPERATIONAL_DAY_START_HOUR = 4;

/**
 * Parses an operational HH:MM.
 *
 * Rules:
 * - minimum is 04:00
 * - no upper hour limit
 * - minutes must be 00–59
 * - hour must be at least 2 digits in stored format
 */
export function operationalHhmmToMinutes(hhmm: string, ignoreStartHour = false): number {
	const match = /^(\d{2,}):(\d{2})$/.exec(hhmm);

	if (!match) {
		throw new Error(`Invalid operational time: ${hhmm}`);
	}

	const hours = Number(match[1]);
	const minutes = Number(match[2]);

	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		throw new Error(`Invalid operational time: ${hhmm}`);
	}

	if (minutes < 0 || minutes > 59) {
		throw new Error(`Invalid minutes in operational time: ${hhmm}`);
	}

	const total = hours * 60 + minutes;
	const minAllowed = OPERATIONAL_DAY_START_HOUR * 60; // 04:00

	if (!ignoreStartHour && total < minAllowed) {
		throw new Error(`Operational time out of range: ${hhmm}`);
	}

	return total;
}

/**
 * Converts common typed time formats into strict HH:MM.
 *
 * Examples:
 * - "800" -> "08:00"
 * - "0800" -> "08:00"
 * - "2200" -> "22:00"
 * - "2600" -> "26:00"
 * - "10000" -> "100:00"
 * - "8:00" -> "08:00"
 * - "26:00" -> "26:00"
 * - "100:00" -> "100:00"
 *
 * Returns null if it cannot normalize safely.
 */
export function normalizeOperationalHhmmInput(value: string): null | string {
	const trimmed = value.trim();

	if (!trimmed) return null;

	// Pure digits: last 2 are minutes, everything before is hours
	if (/^\d{3,}$/.test(trimmed)) {
		const hours = trimmed.slice(0, -2);
		const minutes = trimmed.slice(-2);
		return `${hours.padStart(2, '0')}:${minutes}`;
	}

	// HH:MM with any hour length >= 1
	const match = /^(\d+):(\d{2})$/.exec(trimmed);
	if (match) {
		const [, hours, minutes] = match;
		return `${hours.padStart(2, '0')}:${minutes}`;
	}

	return null;
}

export const HHMMSchema = z
	.string()
	.refine((value) => {
		try {
			operationalHhmmToMinutes(value);
			return true;
		} catch (err) {
			console.warn('Invalid HHMM:', value, err);
			return false;
		}
	}, 'Invalid operational time (expected HH:MM with minimum 04:00)')
	.brand<'HHMM'>();

export type HHMM = z.infer<typeof HHMMSchema>;

/**
 * Runtime-safe creator (validates + brands)
 */
export const hhmm = (value: string): HHMM => HHMMSchema.parse(value);

/* * */

export function timeToMinutes(time: HHMM | string, ignoreStartHour = false): number {
	return operationalHhmmToMinutes(time, ignoreStartHour);
}
