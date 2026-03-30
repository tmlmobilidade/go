import type { Event, Holiday, IsoWeekday, OperationalDate, ScheduleRule, YearPeriod } from '@tmlmobilidade/types';

import { calendarKey, calendarWeekday } from '@/calendar/utils/index.js';
import { Dates } from '@/dates.js';

import { computeActiveRules } from '../calculation/index.js';
import { buildOperationalDateRange } from '../utils/date.js';

// USED IN RulesScheduleView

/**
 * Computes which timepoints are affected by a specific rule.
 * Returns the set of timepoints that should be displayed for this rule in the schedule grid.
 *
 * - Manual include rules: return their timepoints directly
 * - Manual exclude rules: return their timepoints directly
 * - Event replacement rules: return timepoints that apply on the target weekdays
 * - Event restriction rules: return timepoints that are removed on the affected weekdays
 */
export function computeRuleTimePoints(
	rule: ScheduleRule,
	allRules: ScheduleRule[],
	periods: YearPeriod[],
	holidays: Holiday[],
	options?: {
		events?: Event[]
	},
): Set<string> {
	// Manual rules: just return their timepoints
	if (rule.kind === 'manual') {
		if (!rule.event_id) return new Set(rule.timepoints ?? []);
		const event = options?.events?.find(e => e._id === rule.event_id);
		if (!event?.dates?.length) return new Set();
		return new Set(rule.timepoints ?? []);
	}

	// Event rules: need to analyze their impact
	const relevantDates = rule.dates ?? [];
	if (!relevantDates.length) return new Set();

	// Determine which weekdays are affected by this rule
	const affectedWeekdays = new Set<IsoWeekday>();
	for (const opDate of relevantDates) {
		const key = calendarKey(Dates.fromOperationalDate(opDate, 'Europe/Lisbon'));
		affectedWeekdays.add(calendarWeekday(key, holidays));
	}

	// For replacement rules: return timepoints from the TARGET weekdays
	if (rule.kind === 'event_replacement') {
		// When same_weekday is true, each event date maps to its own actual weekday
		const targetWeekdays = rule.same_weekday
			? affectedWeekdays
			: new Set<IsoWeekday>(rule.weekdays || []);
		const targetPeriods = new Set(rule.year_period_ids || []);

		// Find manual include rules that match the target pattern
		const timepoints = new Set<string>();
		for (const r of allRules) {
			if (r.kind !== 'manual' || r.operating_mode !== 'include') continue;

			// Check if this manual rule applies to the target weekdays/periods
			const hasMatchingWeekday = r.weekdays?.some(w => targetWeekdays.has(w));
			const hasMatchingPeriod = r.year_period_ids?.some(p => targetPeriods.has(p));

			if (hasMatchingWeekday && hasMatchingPeriod) {
				for (const tp of r.timepoints || []) {
					timepoints.add(tp);
				}
			}
		}
		return timepoints;
	}

	// For restriction rules: compute what was removed on affected weekdays
	// Generate a sample date range to check (1 year from now)
	const start = Dates.now('Europe/Lisbon').startOf('day').js_date;
	const end = Dates.fromJSDate(start).plus({ years: 1 }).js_date;
	const dateRange = buildOperationalDateRange(start, end);

	const withAll = computeScheduleMap(allRules, dateRange, periods, holidays, options?.events);
	const withoutRule = computeScheduleMap(
		allRules.filter(r => r._id !== rule._id),
		dateRange,
		periods,
		holidays,
		options?.events,
	);

	const removedTimePoints = new Set<string>();

	// Check only dates that match the affected weekdays
	for (const opDate of dateRange) {
		const key = calendarKey(Dates.fromOperationalDate(opDate, 'Europe/Lisbon'));
		const weekday = calendarWeekday(key, holidays);

		// Only look at days that match the affected weekdays
		if (!affectedWeekdays.has(weekday)) continue;

		const before = new Set(withoutRule.get(key)?.timepoints ?? []);
		const after = new Set(withAll.get(key)?.timepoints ?? []);

		// Timepoints that were removed
		for (const tp of before) {
			if (!after.has(tp)) {
				removedTimePoints.add(tp);
			}
		}
	}

	return removedTimePoints;
}

/**
 * Helper: computes schedule for each date in range
 */
function computeScheduleMap(
	rules: ScheduleRule[],
	dateRange: OperationalDate[],
	periods: YearPeriod[],
	holidays: Holiday[],
	events?: Event[],
): Map<string, { timepoints: string[] }> {
	const result = new Map<string, { timepoints: string[] }>();

	for (const date of dateRange) {
		const key = calendarKey(Dates.fromOperationalDate(date, 'Europe/Lisbon'));
		const application = computeActiveRules(date, rules, periods, holidays, { events });
		result.set(key, { timepoints: application.timepoints });
	}

	return result;
}
