import type { IsoWeekday, OperationalDate, Period } from '@tmlmobilidade/types';

import { Dates } from '@tmlmobilidade/dates';

/**
 * Converts an operational date to ISO weekday format.
 *
 * ISO weekdays run from 1 (Monday) to 7 (Sunday), different from JavaScript's
 * Date.getDay() which uses 0 (Sunday) to 6 (Saturday).
 *
 * @param date - Operational date string (YYYY-MM-DD)
 * @returns ISO weekday number: 1=Monday, 2=Tuesday, ..., 7=Sunday
 *
 * @example
 * ```ts
 * getIsoWeekday('2026-02-09'); // 1 (Monday)
 * getIsoWeekday('2026-02-15'); // 7 (Sunday)
 * ```
 */
export function getIsoWeekday(date: OperationalDate): IsoWeekday {
	const dt = Dates.fromOperationalDate(date, 'Europe/Lisbon').js_date;
	const d = dt.getDay(); // 0..6 (Sun..Sat)
	return (d === 0 ? 7 : d) as IsoWeekday;
}

/**
 * Finds the ID of the period that is active on a given date.
 *
 * Searches through periods to find the first one whose dates array includes
 * the specified operational date. Returns empty string if no period matches.
 *
 * @param date - Operational date to check (YYYY-MM-DD)
 * @param periods - Array of period definitions to search
 * @returns The _id of the active period, or empty string if none found
 *
 * @example
 * ```ts
 * const periods = [
 *   { _id: 'school', dates: ['2026-02-01', '2026-02-02', ...] },
 *   { _id: 'summer', dates: ['2026-07-01', '2026-07-02', ...] }
 * ];
 * getActivePeriodId('2026-02-01', periods); // 'school'
 * getActivePeriodId('2026-07-01', periods); // 'summer'
 * getActivePeriodId('2026-12-25', periods); // '' (no match)
 * ```
 */
export function getActivePeriodId(date: OperationalDate, periods: Period[]): string {
	if (!periods?.length) return '';
	for (const p of periods) {
		if (p?.dates?.includes(date)) return p._id;
	}
	return '';
}

/**
 * Generates an array of operational dates between two JavaScript Dates (inclusive).
 *
 * Useful for creating date ranges to pass to calculateRuleApplications or for
 * iterating over calendar periods. Dates are converted to operational date format
 * (YYYY-MM-DD strings) in the Europe/Lisbon timezone.
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
 * // ['2026-02-01', '2026-02-02', '2026-02-03']
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
