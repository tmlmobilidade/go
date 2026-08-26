/* * */

import { type OperationalDateInt, validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

export const COMPARABLE_WEEKDAY_SAMPLE_SIZE = 8;

export function getComparableOperationalDates(
	currentOperationalDate: OperationalDateInt,
	sampleSize = COMPARABLE_WEEKDAY_SAMPLE_SIZE,
): OperationalDateInt[] {
	const value = String(currentOperationalDate);
	const currentDate = new Date(Date.UTC(
		Number(value.slice(0, 4)),
		Number(value.slice(4, 6)) - 1,
		Number(value.slice(6, 8)),
	));

	return Array.from({ length: sampleSize }, (_, index) => {
		const comparableDate = new Date(currentDate);
		comparableDate.setUTCDate(currentDate.getUTCDate() - (index + 1) * 7);

		return validateOperationalDateInt(
			comparableDate.getUTCFullYear() * 10_000
			+ (comparableDate.getUTCMonth() + 1) * 100
			+ comparableDate.getUTCDate(),
		);
	});
}

/* * */
