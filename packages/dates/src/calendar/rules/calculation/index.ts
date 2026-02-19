import type { DayContext, RuleApplication } from './types.js';
import type { EventReplacementRule, ManualRule, OperationalDate, Period, ScheduleRule } from '@tmlmobilidade/types';

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
 * @param periods - Period definitions (school term, summer, etc.) for context resolution
 * @returns Map from CalendarKey to RuleApplication with active time points and metadata
 *
 * @example
 * ```ts
 * const rules = [...]; // Manual, replacement, and restriction rules
 * const dates = ['2026-02-01', '2026-02-02', ...];
 * const periods = [...]; // Period definitions
 *
 * const result = computeActiveTimePoints(rules, dates, periods);
 * const feb1 = result.get(calendarKey(Dates.fromOperationalDate('2026-02-01')));
 * // feb1 = {
 * //   timePoints: ['08:00', '09:00', '10:00'],
 * //   appliedRuleIds: ['rule1', 'rule2']
 * // }
 * ```
 */
export function computeActiveRules(
	date: OperationalDate,
	rules: ScheduleRule[],
	periods: Period[],
): RuleApplication {
	const manualRules = rules.filter((r): r is ManualRule => r.kind === 'manual');
	const restrictionRules = rules.filter(r => r.kind === 'event_restriction');
	const replacementRules = rules.filter((r): r is EventReplacementRule => r.kind === 'event_replacement');

	const key = calendarKey(Dates.fromOperationalDate(date, 'Europe/Lisbon'));

	const replacement = findReplacementForDate(date, replacementRules);

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
		const ctx: DayContext = {
			periodId: getActivePeriodId(date, periods),
			weekday: calendarWeekday(key),
		};

		const base = collectManualIncludes(manualRules, ctx);
		timePoints = base.timePoints;
		appliedRuleIds = base.appliedRuleIds;

		applyManualExcludes(timePoints, appliedRuleIds, manualRules, ctx);
	}

	// 2) Event restrictions always apply by date
	applyEventRestrictions(date, timePoints, appliedRuleIds, restrictionRules);

	const result: RuleApplication = {
		appliedRuleIds,
		timePoints: Array.from(timePoints).sort() || [],
	};

	return result;
}

/* * */
