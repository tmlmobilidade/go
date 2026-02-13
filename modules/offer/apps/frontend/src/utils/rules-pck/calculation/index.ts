import type { DayContext, RuleApplication, RuleApplicationMap } from './types';

import { CalendarKey, calendarKey, calendarWeekday, Dates, datesFromCalendarKey, keyToYYYYMMDD } from '@tmlmobilidade/dates';
import {
	type EventReplacementRule,
	type ManualRule,
	type OperationalDate,
	type Period,
	type ScheduleRule,
} from '@tmlmobilidade/types';

import { getActivePeriodId, getIsoWeekday } from '../utils/date';
import { collectManualIncludes, collectReplacementManualIncludes } from './collectors';
import { applyEventRestrictions, applyManualExcludes, applyReplacementManualExcludes } from './filters';

/**
 * Converts a Set to a sorted array.
 * Helper to ensure consistent time point ordering in results.
 */
function toSortedArray(set: Set<string>): string[] {
	return Array.from(set).sort();
}

/**
 * Builds a DayContext for a normal (non-replacement) day.
 * Determines the active period and ISO weekday for the date.
 */
function buildNormalContext(date: OperationalDate, periods: Period[]): DayContext {
	return {
		periodId: getActivePeriodId(date, periods),
		weekday: getIsoWeekday(date),
	};
}

/**
 * Finds the event replacement rule that applies to a specific date.
 * Returns the first replacement rule whose dates array includes the given date.
 */
function findReplacementForDate(
	date: OperationalDate,
	replacements: EventReplacementRule[],
): EventReplacementRule | null {
	for (const r of replacements) {
		if (r.dates?.includes(date)) return r;
	}
	return null;
}

/* * */

/**
 * Calculates which time points are active for each date in a range, based on scheduling rules.
 *
 * This is the core scheduling algorithm that processes three types of rules:
 * 1. Manual rules (include/exclude) - Define base schedules for weekday/period combinations
 * 2. Event replacement rules - Override base schedules for specific dates
 * 3. Event restriction rules - Remove specific time points or time windows from schedules
 *
 * Algorithm flow for each date:
 * - Check for event replacement rule
 *   - If found: Use intersection-based matching with manual rules
 *   - Otherwise: Use context-based matching (weekday + period)
 * - Collect INCLUDE time points
 * - Apply EXCLUDE time points
 * - Apply event restrictions (by date)
 * - Return final time points and applied rule IDs
 *
 * @param rules - All scheduling rules to process (manual, replacement, restriction)
 * @param dateRange - Array of operational dates to calculate schedules for
 * @param periods - Period definitions (school term, summer, etc.) for context resolution
 * @returns Map from CalendarKey to RuleApplication with active time points and metadata
 *
 * @example
 * ```ts
 * const rules = [...]; // Manual, replacement, and restriction rules
 * const dates = ['2026-02-01', '2026-02-02', ...];
 * const periods = [...]; // Period definitions
 *
 * const result = calculateRuleApplications(rules, dates, periods);
 * const feb1 = result.get(calendarKey(Dates.fromOperationalDate('2026-02-01')));
 * // feb1 = {
 * //   timePoints: ['08:00', '09:00', '10:00'],
 * //   appliedRuleIds: ['rule1', 'rule2'],
 * //   isEventOverride: false
 * // }
 * ```
 */
export function calculateRuleApplications(
	rules: ScheduleRule[],
	dateRange: OperationalDate[],
	periods: Period[],
): RuleApplicationMap {
	const applicationMap: RuleApplicationMap = new Map();

	const manualRules = rules.filter((r): r is ManualRule => r.kind === 'manual');
	const restrictionRules = rules.filter(r => r.kind === 'event_restriction');
	const replacementRules = rules.filter((r): r is EventReplacementRule => r.kind === 'event_replacement');

	for (const date of dateRange) {
		const key = calendarKey(Dates.fromOperationalDate(date, 'Europe/Lisbon'));

		const replacement = findReplacementForDate(date, replacementRules);
		const isEventOverride = !!replacement;

		// 1) Base timepoints
		let timePoints: Set<string>;
		let appliedRuleIds: string[];

		if (replacement) {
			// Replacement mode: match manuals by intersection (Option A)
			const base = collectReplacementManualIncludes(replacement, manualRules);
			timePoints = base.timePoints;
			appliedRuleIds = base.appliedRuleIds;

			// Apply manual excludes *also* by intersection with replacement targets
			applyReplacementManualExcludes(timePoints, appliedRuleIds, replacement, manualRules);
		}
		else {
			// Normal mode: day resolves to a single weekday + single periodId
			const ctx: DayContext = buildNormalContext(date, periods);

			const base = collectManualIncludes(manualRules, ctx);
			timePoints = base.timePoints;
			appliedRuleIds = base.appliedRuleIds;

			applyManualExcludes(timePoints, appliedRuleIds, manualRules, ctx);
		}

		// 2) Event restrictions always apply by date
		applyEventRestrictions(date, timePoints, appliedRuleIds, restrictionRules);

		const result: RuleApplication = {
			appliedRuleIds,
			isEventOverride,
			timePoints: toSortedArray(timePoints),
		};

		applicationMap.set(key, result);
	}

	return applicationMap;
}

/* * */

/**
 * Context for computing which dates a manual rule affects within a calendar range.
 */
interface CalendarContext {
	/** End date of the calendar range */
	endDate: Date
	/** Available periods for matching rule criteria */
	periods: Period[]
	/** Start date of the calendar range */
	startDate: Date
}

/**
 * Checks if a rule's period criteria matches a specific calendar date.
 * Verifies that at least one of the rule's period IDs is active on this date.
 */
function isInPeriod(rule: ManualRule, key: CalendarKey, ctx: CalendarContext): boolean {
	if (!rule.periodIds?.length) return false;

	const op = keyToYYYYMMDD(key) as OperationalDate;
	return ctx.periods.some(p => rule.periodIds?.includes(p._id) && p.dates?.includes(op));
}

/**
 * Determines if a manual rule applies to a specific calendar date.
 * Checks both period membership and weekday matching.
 */
function ruleAppliesToCivilKey(rule: ManualRule, key: CalendarKey, ctx: CalendarContext): boolean {
	const weekday = calendarWeekday(key);

	// 1) Period required
	if (!isInPeriod(rule, key, ctx)) return false;

	// 2) Weekdays required
	if (!rule.weekdays?.length) return false;
	if (!rule.weekdays.includes(weekday)) return false;

	return true;
}

/**
 * Computes which dates within a calendar range are affected by a manual rule.
 *
 * Used in the UI to preview which dates will be impacted when creating or editing
 * a manual rule. Checks each date in the range to see if it matches the rule's
 * weekday and period criteria.
 *
 * @param rule - The manual rule to analyze
 * @param ctx - Calendar context with date range and periods
 * @returns Object with count and array of affected CalendarKeys
 *
 * @example
 * ```ts
 * const rule = { weekdays: [1, 2, 3], periodIds: ['school'], ... };
 * const ctx = {
 *   startDate: new Date('2026-02-01'),
 *   endDate: new Date('2026-02-28'),
 *   periods: [...]
 * };
 * const result = computeRuleImpact(rule, ctx);
 * // result = { count: 12, dates: [...] } // 12 weekdays in Feb 2026
 * ```
 */
export function computeRuleImpact(rule: ManualRule, ctx: CalendarContext) {
	const affected: CalendarKey[] = [];

	const startKey = calendarKey(Dates.fromJSDate(ctx.startDate));
	const endKey = calendarKey(Dates.fromJSDate(ctx.endDate));

	const from = startKey < endKey ? startKey : endKey;
	const to = startKey < endKey ? endKey : startKey;

	let current = datesFromCalendarKey(from);
	const end = datesFromCalendarKey(to);

	while (current.unix_timestamp <= end.unix_timestamp) {
		const key = calendarKey(current);

		if (ruleAppliesToCivilKey(rule, key, ctx)) {
			affected.push(key);
		}

		current = current.plus({ days: 1 });
	}

	return { count: affected.length, dates: affected };
}
