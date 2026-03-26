import type { DayContext, RuleApplication } from './types.js';
import type { Event, EventReplacementRule, HHMM, ManualRule, OperationalDate, ScheduleRule, YearPeriod } from '@tmlmobilidade/types';

import { calendarKey, calendarWeekday } from '@/calendar/utils/index.js';
import { Dates } from '@/dates.js';

import { findReplacementForDate, getActivePeriodId } from '../utils/date.js';
import { collectManualIncludes, collectReplacementManualIncludes } from './collectors.js';
import { applyEventRestrictions, applyManualExcludes, applyReplacementManualExcludes } from './filters.js';

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
 * @param periods - YearPeriod definitions (school term, summer, etc.) for context resolution
 * @returns Map from CalendarKey to RuleApplication with active time points and metadata
 *
 * @example
 * ```ts
 * const rules = [...]; // Manual, replacement, and restriction rules
 * const dates = ['2026-02-01', '2026-02-02', ...];
 * const periods = [...]; // YearPeriod definitions
 *
 * const result = computeActiveTimePoints(rules, dates, periods);
 * const feb1 = result.get(calendarKey(Dates.fromOperationalDate('2026-02-01')));
 * // feb1 = {
 * //   timepoints: ['08:00', '09:00', '10:00'],
 * //   appliedRuleIds: ['rule1', 'rule2']
 * // }
 * ```
 */
export function computeActiveRules(
	date: OperationalDate,
	rules: ScheduleRule[],
	periods: YearPeriod[],
	options?: {
		events?: Event[]
	},
): RuleApplication {
	const manualRules = rules.filter((r): r is ManualRule => r.kind === 'manual');
	const restrictionRules = rules.filter(r => r.kind === 'event_restriction');
	const replacementRules = rules.filter((r): r is EventReplacementRule => r.kind === 'event_replacement');

	const filteredManualRules = manualRules.filter((rule) => {
		if (!rule.event_id) return true;
		const event = options?.events?.find(e => e._id === rule.event_id);
		if (!event?.dates?.length) return false;
		return event.dates.includes(date);
	});

	const key = calendarKey(Dates.fromOperationalDate(date, 'Europe/Lisbon'));

	const replacement = findReplacementForDate(date, replacementRules);

	// 1) Base timepoints
	let timepoints: Set<HHMM>;
	let appliedRuleIds: string[];

	if (replacement) {
		// When same_weekday is true, each event date functions as its own actual weekday
		// within the replacement's target periods, rather than all dates acting as one fixed weekday.
		const effectiveReplacement = replacement.same_weekday
			? { ...replacement, weekdays: [calendarWeekday(key)] }
			: replacement;

		// Replacement mode: match manuals by intersection (Option A)
		const base = collectReplacementManualIncludes(effectiveReplacement, filteredManualRules);
		timepoints = base.timepoints;
		appliedRuleIds = base.appliedRuleIds;

		// Apply manual excludes *also* by intersection with replacement targets
		applyReplacementManualExcludes(timepoints, appliedRuleIds, effectiveReplacement, filteredManualRules);
	} else {
		// Normal mode: day resolves to a single weekday + single yearPeriodId
		const ctx: DayContext = {
			weekday: calendarWeekday(key),
			yearPeriodId: getActivePeriodId(date, periods),
		};

		const base = collectManualIncludes(filteredManualRules, ctx);
		timepoints = base.timepoints;
		appliedRuleIds = base.appliedRuleIds;

		applyManualExcludes(timepoints, appliedRuleIds, filteredManualRules, ctx);
	}

	// 2) Event restrictions always apply by date
	applyEventRestrictions(date, timepoints, appliedRuleIds, restrictionRules);

	const result: RuleApplication = {
		appliedRuleIds,
		timepoints: Array.from(timepoints).sort() as HHMM[],
	};

	return result;
}

/* * */
