import type { EventReplacementRule, OperationalDate, YearPeriod } from '@tmlmobilidade/types';

import { Dates } from '@/dates.js';

/**
 * Finds the ID of the period that is active on a given date.
 *
 * @param date - Operational date to check (YYYYMMDD)
 * @param periods - Array of period definitions to search
 * @returns The _id of the active period, or empty string if none found
 *
 */
export function getActivePeriodId(date: OperationalDate, periods: YearPeriod[]): string {
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
	date: OperationalDate,
	replacements: EventReplacementRule[],
): EventReplacementRule | null {
	for (const r of replacements) {
		if (r.dates?.includes(date)) return r;
	}
	return null;
}

/**
 * Generates an array of operational dates between two JavaScript Dates (inclusive).
 *
 * Useful for creating date ranges to pass to calculateRuleApplications or for
 * iterating over calendar periods. Dates are converted to operational date format
 * (YYYYMMDD strings) in the Europe/Lisbon timezone.
 *
 * @param startDate - Start of the range (inclusive)
 * @param endDate - End of the range (inclusive)
 * @returns Array of operational dates from start to end
 *
 * @example
 * ```ts
 * const start = new Date('2026-02-01');
 * const end = new Date('2026-02-03');
 * buildOperationalDateRange(start, end);
 * // ['20260201', '20260202', '20260203']
 * ```
 */
export function buildOperationalDateRange(startDate: Date, endDate: Date): OperationalDate[] {
	const dateRange: OperationalDate[] = [];
	let current = Dates.fromJSDate(startDate);
	const end = Dates.fromJSDate(endDate);

	while (current.unix_timestamp <= end.unix_timestamp) {
		dateRange.push(current.operational_date);
		current = current.plus({ days: 1 });
	}
	return dateRange;
}
