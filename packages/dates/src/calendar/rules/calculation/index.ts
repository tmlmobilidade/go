import type { DayContext, RuleApplication } from './types.js';
import type { Event, EventReplacementRule, HHMM, Holiday, ManualRule, OperationalDate, ScheduleRule, YearPeriod } from '@tmlmobilidade/types';

import { calendarKey, calendarWeekday } from '@/calendar/utils/index.js';
import { Dates } from '@/dates.js';

import { resolveEffectiveReplacement } from '../export-attribution/replacement.js';
import { findReplacementForDate, getActivePeriodId } from '../utils/date.js';
import { collectManualIncludes, collectReplacementManualIncludes } from './collectors.js';
import { applyEventRestrictions, applyManualExcludes, applyReplacementManualExcludes } from './filters.js';

/* * */

/**
 * Operating schedule for one operational date: merged timepoints and applied rule IDs.
 *
 * This is the core scheduling algorithm for “what runs” (preview, VKM, rules grid).
 * It processes three rule kinds:
 * 1. Manual rules (include/exclude) — base schedules for weekday/period combinations
 * 2. Event replacement rules — override base schedules on specific dates
 * 3. Event restriction rules — remove timepoints or windows from the result
 *
 * Algorithm flow:
 * - If a replacement applies: intersection-based manual matching + replacement excludes
 * - Otherwise: weekday + period context matching + manual excludes
 * - Always apply event restrictions by date
 *
 * For GTFS `service_id` token binding (`operating` / `base_off` rows), use
 * `collectGtfsIncludeContributionsForDate` in `export-attribution/index.ts`.
 * That layer delegates here on replacement days; the `operating` timepoint set
 * should match this function’s result (see SCENARIOS P5).
 *
 * @param date - Operational date to evaluate
 * @param rules - All scheduling rules (manual, replacement, restriction)
 * @param periods - YearPeriod definitions for context resolution
 * @param holidays - Holiday calendar for weekday resolution
 * @returns Active timepoints and IDs of rules that contributed
 */
export function computeActiveRules(
	date: OperationalDate,
	rules: ScheduleRule[],
	periods: YearPeriod[],
	holidays: Holiday[],
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

	// Filter out manual rules whose months list doesn't include the current month
	const month = Number(key.slice(5, 7));
	const monthFilteredManualRules = filteredManualRules.filter(rule =>
		!rule.months?.length || (rule.months as number[]).includes(month),
	);

	const replacement = findReplacementForDate(date, replacementRules);

	// 1) Base timepoints
	let timepoints: Set<HHMM>;
	let appliedRuleIds: string[];

	if (replacement) {
		const effectiveReplacement = resolveEffectiveReplacement(date, replacement, holidays);

		// Replacement mode: match manuals by intersection (Option A)
		const base = collectReplacementManualIncludes(effectiveReplacement, monthFilteredManualRules);
		timepoints = base.timepoints;
		appliedRuleIds = base.appliedRuleIds;

		// Apply manual excludes *also* by intersection with replacement targets
		applyReplacementManualExcludes(timepoints, appliedRuleIds, effectiveReplacement, monthFilteredManualRules);
	} else {
		// Normal mode: day resolves to a single weekday + single yearPeriodId
		const ctx: DayContext = {
			weekday: calendarWeekday(key, holidays),
			yearPeriodId: getActivePeriodId(date, periods),
		};

		const base = collectManualIncludes(monthFilteredManualRules, ctx);
		timepoints = base.timepoints;
		appliedRuleIds = base.appliedRuleIds;

		applyManualExcludes(timepoints, appliedRuleIds, monthFilteredManualRules, ctx);
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
