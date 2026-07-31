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

export const WEEKDAY_OPTIONS = [
	{ label: 'Seg', value: WEEKDAYS.Mon },
	{ label: 'Ter', value: WEEKDAYS.Tue },
	{ label: 'Qua', value: WEEKDAYS.Wed },
	{ label: 'Qui', value: WEEKDAYS.Thu },
	{ label: 'Sex', value: WEEKDAYS.Fri },
	{ label: 'Sáb', value: WEEKDAYS.Sat },
	{ label: 'Dom e Fer', value: WEEKDAYS.Sun },
] as const;
