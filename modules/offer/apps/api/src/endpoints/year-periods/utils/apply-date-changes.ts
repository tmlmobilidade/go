import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { mergeDateArrays, removeDatesFromArray } from '@tmlmobilidade/go-utils-dates';

/* * */

export function applyYearPeriodDateChanges(
	existingDates: OperationalDateInt[],
	addDates: OperationalDateInt[],
	removeDates: OperationalDateInt[],
): OperationalDateInt[] {
	const datesAfterRemoval = removeDatesFromArray(existingDates, removeDates);
	return mergeDateArrays(datesAfterRemoval, addDates);
}
