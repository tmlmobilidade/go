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
