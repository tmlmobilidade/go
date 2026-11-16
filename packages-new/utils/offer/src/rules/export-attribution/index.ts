import type { DayContext } from '../calculation/types.js';
import type { GtfsIncludeContribution } from './types.js';
import type { Event, EventReplacementRule, ManualRule, ScheduleRule, YearPeriod } from '@tmlmobilidade/go-types-offer';
import type { OperationalDateInt } from '@tmlmobilidade/go-types-shared';

import { calendarWeekday } from '@/scheduling-calendar.js';
import { type Holiday } from '@tmlmobilidade/go-types-dates';
import { calendarKey, Dates } from '@tmlmobilidade/go-utils-dates';

import { manualRuleMatchesMonth } from '../calculation/matchers.js';
import { findReplacementForDate, getActivePeriodId } from '../utils/date.js';
import { collectNormalDayContributionsReconciled } from './normal-day-contributions.js';
import { collectReplacementDayContributions } from './replacement-day-contributions.js';

export * from './canonical-registry.js';
export * from './collectors.js';
export { compareGeneralManualOwnershipPriority } from './manual-ownership.js';
export * from './replacement.js';
export * from './trip-row-dates.js';
export * from './types.js';

/** Keeps event-linked manuals only when the event lists `date` (same filter as {@link computeActiveRules}). */
function filterManualRulesForDate(
	manualRules: ManualRule[],
	date: OperationalDateInt,
	events?: Event[],
): ManualRule[] {
	return manualRules.filter((rule) => {
		if (!rule.event_id) return true;
		const event = events?.find(e => e._id === rule.event_id);
		if (!event?.dates?.length) return false;
		return event.dates.includes(date);
	});
}

/** Drops manuals whose `months` list does not include the date’s calendar month. */
function filterManualRulesByMonth(manualRules: ManualRule[], date: OperationalDateInt): ManualRule[] {
	const key = calendarKey(Dates.fromOperationalDateInt(date, 'Europe/Lisbon'));
	const month = Number(key.slice(5, 7));

	return manualRules.filter(rule => manualRuleMatchesMonth(rule, month));
}

/**
 * GTFS export attribution for one operational date.
 *
 * Unlike {@link computeActiveRules}, which returns the merged operating timepoint set,
 * this returns per-timepoint contributions so the exporter can attach the correct
 * `service_id` rows (`operating` and `base_off`).
 *
 * **Invariant (P5):** the set of `operating` timepoints should match
 * `computeActiveRules(date, allRules, periods, holidays, options).timepoints`.
 *
 * @see SCENARIOS.md for scenario IDs (FR-*, ND-*, ER-*).
 *
 * - Normal days → {@link collectNormalDayContributionsReconciled}
 * - Replacement days → {@link collectReplacementDayContributions}
 */
export function collectGtfsIncludeContributionsForDate(
	date: OperationalDateInt,
	allRules: ScheduleRule[],
	periods: YearPeriod[],
	holidays: Holiday[],
	options?: { events?: Event[] },
): GtfsIncludeContribution[] {
	const manualRules = allRules.filter((r): r is ManualRule => r.kind === 'manual');
	const replacementRules = allRules.filter((r): r is EventReplacementRule => r.kind === 'event_replacement');

	const filteredManualRules = filterManualRulesForDate(manualRules, date, options?.events);
	const monthFilteredManualRules = filterManualRulesByMonth(filteredManualRules, date);

	const replacement = findReplacementForDate(date, replacementRules);

	if (replacement) {
		return collectReplacementDayContributions(
			date,
			replacement,
			allRules,
			monthFilteredManualRules,
			periods,
			holidays,
			options?.events,
		);
	}

	const key = calendarKey(Dates.fromOperationalDateInt(date, 'Europe/Lisbon'));
	const ctx: DayContext = {
		weekday: calendarWeekday(key, holidays),
		yearPeriodId: getActivePeriodId(date, periods),
	};

	return collectNormalDayContributionsReconciled(
		date,
		allRules,
		monthFilteredManualRules,
		ctx,
		periods,
		holidays,
		options?.events,
	);
}
