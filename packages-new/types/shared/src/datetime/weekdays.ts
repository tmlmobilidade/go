/* * */

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
