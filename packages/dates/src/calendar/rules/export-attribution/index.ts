import type { DayContext } from '../calculation/types.js';
import type { GtfsIncludeContribution } from './types.js';
import type { Event, EventReplacementRule, HHMM, Holiday, ManualRule, OperationalDate, ScheduleRule, YearPeriod } from '@tmlmobilidade/types';

import { calendarKey, calendarWeekday } from '@/calendar/utils/index.js';
import { Dates } from '@/dates.js';
import { hhmm } from '@tmlmobilidade/types';

import { computeActiveRules } from '../calculation/index.js';
import { findReplacementForDate, getActivePeriodId } from '../utils/date.js';
import { shouldEmitReplacementOnForcedRetarget } from './canonical-registry.js';
import { collectManualIncludesByRule, collectReplacementManualIncludesByRule } from './collectors.js';
import { isForcedRetargetDay, resolveEffectiveReplacement } from './replacement.js';

export * from './canonical-registry.js';
export * from './collectors.js';
export * from './replacement.js';
export * from './types.js';

/** Keeps event-linked manuals only when the event lists `date` (same filter as {@link computeActiveRules}). */
function filterManualRulesForDate(
	manualRules: ManualRule[],
	date: OperationalDate,
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
function filterManualRulesByMonth(manualRules: ManualRule[], date: OperationalDate): ManualRule[] {
	const key = calendarKey(Dates.fromOperationalDate(date, 'Europe/Lisbon'));
	const month = Number(key.slice(5, 7));

	return manualRules.filter(rule =>
		!rule.months?.length || (rule.months as number[]).includes(month),
	);
}

/**
 * Sort key for overlapping general manuals (ND-03).
 *
 * Higher timepoint count wins; tie-break by `_id` lexicographic order.
 *
 * @returns Negative if `a` should sort before `b` (i.e. `b` has higher priority).
 */
export function compareGeneralManualOwnershipPriority(a: ManualRule, b: ManualRule): number {
	const aCount = a.timepoints?.length ?? 0;
	const bCount = b.timepoints?.length ?? 0;
	if (aCount !== bCount) return bCount - aCount;

	return (a._id ?? '').localeCompare(b._id ?? '');
}

/**
 * Non-replacement days: assign each matching timepoint to one `operating` rule.
 *
 * Event-specific manuals claim first; general manuals follow {@link compareGeneralManualOwnershipPriority}.
 * When two generals share a timepoint, only one `operating` row is emitted (ND-03).
 * When an event manual displaces a general on the same timepoint, emits `base_off` (ND-02).
 */
function collectNormalDayContributions(
	monthFilteredManualRules: ManualRule[],
	ctx: DayContext,
): GtfsIncludeContribution[] {
	const contributions: GtfsIncludeContribution[] = [];
	const claimedTimepoints = new Set<HHMM>();
	const timepointOwners = new Map<HHMM, ManualRule>();

	const matchingRules = collectManualIncludesByRule(monthFilteredManualRules, ctx);
	const eventSpecificRules = matchingRules.filter(({ rule }) => !!rule.event_id);
	const generalRules = matchingRules
		.filter(({ rule }) => !rule.event_id)
		.sort((a, b) => compareGeneralManualOwnershipPriority(a.rule, b.rule));

	for (const { rule, timepoints } of eventSpecificRules) {
		for (const rawTimepoint of timepoints) {
			const timepoint = hhmm(rawTimepoint);
			if (claimedTimepoints.has(timepoint)) continue;

			claimedTimepoints.add(timepoint);
			timepointOwners.set(timepoint, rule);
			contributions.push({ kind: 'operating', rule, timepoint });
		}
	}

	for (const { rule, timepoints } of generalRules) {
		for (const rawTimepoint of timepoints) {
			const timepoint = hhmm(rawTimepoint);

			if (claimedTimepoints.has(timepoint)) {
				const ownerRule = timepointOwners.get(timepoint);
				if (!ownerRule) continue;

				// ND-03: overlapping general manuals co-apply in the rules engine — one circulation,
				// one operating row. base_off is only for event/replacement displacement (ND-02, FR-*).
				if (!ownerRule.event_id && !rule.event_id) continue;

				contributions.push({ excludeRule: ownerRule, kind: 'base_off', rule, timepoint });
				continue;
			}

			claimedTimepoints.add(timepoint);
			timepointOwners.set(timepoint, rule);
			contributions.push({ kind: 'operating', rule, timepoint });
		}
	}

	return contributions;
}

/**
 * Replacement days: bind GTFS tokens using {@link computeActiveRules} as operating truth.
 *
 * **Forced retarget** — operating TPs on the replacement rule (+ `base_off` on calendar base owners);
 * calendar-only TPs get `base_off` when absent from the operating set (FR-02, FR-03).
 * Skips the replacement row when calendar manuals already cover the full operating set (FR-04).
 *
 * **Same_weekday** — `operating` rows on manuals that match the replacement and appear in the operating set.
 */
function collectReplacementDayContributions(
	date: OperationalDate,
	replacement: EventReplacementRule,
	allRules: ScheduleRule[],
	monthFilteredManualRules: ManualRule[],
	periods: YearPeriod[],
	holidays: Holiday[],
	events?: Event[],
): GtfsIncludeContribution[] {
	const contributions: GtfsIncludeContribution[] = [];
	const effectiveReplacement = resolveEffectiveReplacement(date, replacement, holidays);
	const operating = computeActiveRules(date, allRules, periods, holidays, { events });
	const operatingTimepoints = new Set(operating.timepoints.map(tp => hhmm(tp)));

	const replacementAsRule = allRules.find(r => r._id === replacement._id) ?? replacement;
	const forcedRetarget = isForcedRetargetDay(date, effectiveReplacement, holidays);

	const key = calendarKey(Dates.fromOperationalDate(date, 'Europe/Lisbon'));
	const calendarCtx: DayContext = {
		weekday: calendarWeekday(key, holidays),
		yearPeriodId: getActivePeriodId(date, periods),
	};
	const calendarContributions = collectNormalDayContributions(monthFilteredManualRules, calendarCtx);
	const calendarOperatingByTimepoint = new Map<HHMM, ScheduleRule>();
	for (const contribution of calendarContributions) {
		if (contribution.kind !== 'operating') continue;
		calendarOperatingByTimepoint.set(contribution.timepoint, contribution.rule);
	}

	if (forcedRetarget) {
		const emitReplacement = shouldEmitReplacementOnForcedRetarget(
			operatingTimepoints,
			calendarOperatingByTimepoint,
		);

		for (const timepoint of operatingTimepoints) {
			const ownerRule = calendarOperatingByTimepoint.get(timepoint);

			if (emitReplacement) {
				contributions.push({ kind: 'operating', rule: replacementAsRule, timepoint });
				// Shared timepoint (FR-03): replacement runs on the event date; base is OFF, not plain.
				if (ownerRule) {
					contributions.push({
						excludeRule: replacementAsRule,
						kind: 'base_off',
						rule: ownerRule,
						timepoint,
					});
				}
				continue;
			}

			if (ownerRule) {
				contributions.push({ kind: 'operating', rule: ownerRule, timepoint });
			}
		}

		// Weekday-owned timepoints that are not in the replacement operating set (e.g. 06:40
		// when Carnival runs Saturday times from 06:45) → BASE-OFF-replacement on event dates.
		for (const [timepoint, ownerRule] of calendarOperatingByTimepoint) {
			if (operatingTimepoints.has(timepoint)) continue;

			contributions.push({
				excludeRule: replacementAsRule,
				kind: 'base_off',
				rule: ownerRule,
				timepoint,
			});
		}
	} else {
		// same_weekday: operating stays on matching manual rules.
		for (const { rule, timepoints } of collectReplacementManualIncludesByRule(effectiveReplacement, monthFilteredManualRules)) {
			for (const rawTimepoint of timepoints) {
				const timepoint = hhmm(rawTimepoint);
				if (!operatingTimepoints.has(timepoint)) continue;
				contributions.push({ kind: 'operating', rule, timepoint });
			}
		}
	}

	return contributions;
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
 * - Normal days → {@link collectNormalDayContributions}
 * - Replacement days → {@link collectReplacementDayContributions}
 */
export function collectGtfsIncludeContributionsForDate(
	date: OperationalDate,
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

	const key = calendarKey(Dates.fromOperationalDate(date, 'Europe/Lisbon'));
	const ctx: DayContext = {
		weekday: calendarWeekday(key, holidays),
		yearPeriodId: getActivePeriodId(date, periods),
	};

	return collectNormalDayContributions(monthFilteredManualRules, ctx);
}
