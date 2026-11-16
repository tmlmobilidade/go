import type { EventReplacementRule, YearPeriod } from '@tmlmobilidade/go-types-offer';
import type { OperationalDateInt } from '@tmlmobilidade/go-types-shared';

/**
 * Finds the ID of the period that is active on a given date.
 *
 * @param date - Operational date to check (YYYYMMDD)
 * @param periods - Array of period definitions to search
 * @returns The _id of the active period, or empty string if none found
 *
 */
export function getActivePeriodId(date: OperationalDateInt, periods: YearPeriod[]): string {
	if (!periods?.length) return '';
	for (const p of periods) {
		if (p?.dates?.includes(date)) return p._id;
	}
	return '';
}

/**
 * Finds the event replacement rule that applies to a specific date.
 * Returns the first replacement rule whose dates array includes the given date.
 */
export function findReplacementForDate(
	date: OperationalDateInt,
	replacements: EventReplacementRule[],
): EventReplacementRule | null {
	for (const r of replacements) {
		if (r.dates?.includes(date)) return r;
	}
	return null;
}
