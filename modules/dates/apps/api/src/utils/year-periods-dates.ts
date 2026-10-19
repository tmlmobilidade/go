import { mergeDateArrays, removeDatesFromArray } from '@tmlmobilidade/dates';
import { type OperationalDate } from '@tmlmobilidade/go-types-shared';

/* * */

export function applyYearPeriodDateChanges(
	existingDates: OperationalDate[],
	addDates: OperationalDate[],
	removeDates: OperationalDate[],
): OperationalDate[] {
	const datesAfterRemoval = removeDatesFromArray(existingDates, removeDates);
	return mergeDateArrays(datesAfterRemoval, addDates);
}
