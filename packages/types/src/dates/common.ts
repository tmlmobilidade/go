/* * */

import { z } from 'zod';

// TODO: Move this to its own file

export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const WEEKDAYS = {
	Fri: 5,
	Mon: 1,
	Sat: 6,
	Sun: 7,
	Thu: 4,
	Tue: 2,
	Wed: 3,
} as const satisfies Record<string, IsoWeekday>;

export const WEEKDAY_OPTIONS = [
	{ label: 'Seg', value: WEEKDAYS.Mon },
	{ label: 'Ter', value: WEEKDAYS.Tue },
	{ label: 'Qua', value: WEEKDAYS.Wed },
	{ label: 'Qui', value: WEEKDAYS.Thu },
	{ label: 'Sex', value: WEEKDAYS.Fri },
	{ label: 'Sáb', value: WEEKDAYS.Sat },
	{ label: 'Dom e Fer', value: WEEKDAYS.Sun },
] as const;

/* * */

const OPERATIONAL_DAY_START_HOUR = 4;
const OPERATIONAL_DAY_LAST_HOUR = 27;
const OPERATIONAL_DAY_LAST_MINUTE = 59;

/**
 * Parses an operational HH:MM.
 *
 */
export function operationalHhmmToMinutes(hhmm: string): number {
	const match = /^(\d{2}):(\d{2})$/.exec(hhmm);

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
	const maxAllowed = OPERATIONAL_DAY_LAST_HOUR * 60 + OPERATIONAL_DAY_LAST_MINUTE; // 27:59

	if (total < minAllowed || total > maxAllowed) {
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
 * - "8:00" -> "08:00"
 *
 * Returns null if it cannot normalize safely.
 */
export function normalizeOperationalHhmmInput(value: string): null | string {
	const trimmed = value.trim();

	if (!trimmed) return null;

	// Pure digits: allow HMM or HHMM
	if (/^\d{3}$/.test(trimmed)) {
		const hours = trimmed.slice(0, 1).padStart(2, '0');
		const minutes = trimmed.slice(1, 3);
		return `${hours}:${minutes}`;
	}

	if (/^\d{4}$/.test(trimmed)) {
		const hours = trimmed.slice(0, 2);
		const minutes = trimmed.slice(2, 4);
		return `${hours}:${minutes}`;
	}

	// H:MM or HH:MM
	const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
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
		} catch {
			return false;
		}
	}, 'Invalid operational time (expected 04:00–27:59)')
	.brand<'HHMM'>();

export type HHMM = z.infer<typeof HHMMSchema>;

/**
 * Runtime-safe creator (validates + brands)
 */
export const hhmm = (value: string): HHMM => HHMMSchema.parse(value);

/* * */

export function timeToMinutes(time: HHMM): number {
	return operationalHhmmToMinutes(time);
}
