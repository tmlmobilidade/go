/* * */

export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export const MONTHS = {
	Apr: 4,
	Aug: 8,
	Dec: 12,
	Feb: 2,
	Jan: 1,
	Jul: 7,
	Jun: 6,
	Mar: 3,
	May: 5,
	Nov: 11,
	Oct: 10,
	Sep: 9,
} as const satisfies Record<string, Month>;

export const MONTH_OPTIONS = [
	{ label: 'Jan', value: MONTHS.Jan },
	{ label: 'Fev', value: MONTHS.Feb },
	{ label: 'Mar', value: MONTHS.Mar },
	{ label: 'Abr', value: MONTHS.Apr },
	{ label: 'Mai', value: MONTHS.May },
	{ label: 'Jun', value: MONTHS.Jun },
	{ label: 'Jul', value: MONTHS.Jul },
	{ label: 'Ago', value: MONTHS.Aug },
	{ label: 'Set', value: MONTHS.Sep },
	{ label: 'Out', value: MONTHS.Oct },
	{ label: 'Nov', value: MONTHS.Nov },
	{ label: 'Dez', value: MONTHS.Dec },
] as const;
