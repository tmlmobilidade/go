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

const HHMMRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const HHMMSchema = z
	.string()
	.regex(HHMMRegex, 'Invalid time format (expected HH:MM 00:00–23:59)')
	.brand<'HHMM'>();

export type HHMM = z.infer<typeof HHMMSchema>;

/**
 * Runtime-safe creator (validates + brands)
 */
export const hhmm = (value: string): HHMM => HHMMSchema.parse(value);

/* * */

export function timeToMinutes(time: HHMM): number {
	const [hours, minutes] = time.split(':').map(Number);
	return hours * 60 + minutes;
}
