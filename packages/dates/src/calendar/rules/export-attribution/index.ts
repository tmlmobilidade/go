import type { DayContext } from '../calculation/types.js';
import type { GtfsIncludeContribution } from './types.js';
import type { Event, EventReplacementRule, HHMM, Holiday, ManualRule, OperationalDate, ScheduleRule, YearPeriod } from '@tmlmobilidade/types';

import { calendarKey, calendarWeekday } from '@/calendar/utils/index.js';
import { Dates } from '@/dates.js';
import { hhmm } from '@tmlmobilidade/types';

import { computeActiveRules } from '../calculation/index.js';
import { getTimepointsRemovedByEventRestriction } from '../calculation/filters.js';
import { findReplacementForDate, getActivePeriodId } from '../utils/date.js';
import { shouldEmitReplacementOnForcedRetarget } from './canonical-registry.js';
import { collectManualIncludesByRule, collectReplacementManualIncludesByRule } from './collectors.js';
import { isForcedRetargetDay, resolveEffectiveReplacement } from './replacement.js';

export * from './canonical-registry.js';
export * from './collectors.js';
export * from './replacement.js';
export * from './trip-row-dates.js';
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

const ALL_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];
const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function isSubsetOf(inner: readonly (number | string)[], outer: readonly (number | string)[]): boolean {
	const set = new Set(outer);
	return inner.every(x => set.has(x));
}

/**
 * True when every date `inner` applies on is also covered by `outer`.
 *
 * A manual rule applies on date `D` iff `weekday(D) ∈ weekdays ∧ period(D) ∈ year_period_ids ∧
 * month(D) ∈ months` (an empty list means "all"). So `inner`'s applicable dates ⊆ `outer`'s
 * exactly when `outer`'s scope contains `inner`'s on every dimension. This is the sound,
 * data-free realization of "every date applied by `inner` is also applied by `outer`".
 */
function scopeContains(outer: ManualRule, inner: ManualRule): boolean {
	const outerWeekdays = outer.weekdays?.length ? outer.weekdays : ALL_WEEKDAYS;
	const innerWeekdays = inner.weekdays?.length ? inner.weekdays : ALL_WEEKDAYS;
	if (!isSubsetOf(innerWeekdays, outerWeekdays)) return false;

	const outerMonths = outer.months?.length ? outer.months : ALL_MONTHS;
	const innerMonths = inner.months?.length ? inner.months : ALL_MONTHS;
	if (!isSubsetOf(innerMonths, outerMonths)) return false;

	// Empty year_period_ids = all periods (open-ended universe). An empty outer covers every
	// period; an empty inner is only contained by an empty outer.
	if (!outer.year_period_ids?.length) return true;
	if (!inner.year_period_ids?.length) return false;
	return isSubsetOf(inner.year_period_ids, outer.year_period_ids);
}

/**
 * Ownership order for overlapping general manuals (ND-03).
 *
 * When one rule's applicable dates strictly contain the other's (e.g. an "all days" rule vs a
 * "weekdays" rule sharing a timepoint), the **broader** rule owns the shared timepoint so its
 * date set stays whole and the export emits one clean token instead of fragmenting across two
 * (`ALL` + `ALL_DU`). We only override on true containment — for equal or partially-overlapping
 * scopes the choice is genuinely ambiguous, so the primary schedule (more timepoints, then `_id`)
 * wins, exactly as before.
 *
 * @returns Negative if `a` should sort before `b` (i.e. `a` owns the shared timepoint).
 */
export function compareGeneralManualOwnershipPriority(a: ManualRule, b: ManualRule): number {
	const aContainsB = scopeContains(a, b);
	const bContainsA = scopeContains(b, a);
	if (aContainsB && !bContainsA) return -1; // a strictly broader → a owns
	if (bContainsA && !aContainsB) return 1; // b strictly broader → b owns

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

/** Rule that removed `timepoint` from the calendar operating set on this date (exclude or restriction). */
function findDisplacementExcludeRule(
	date: OperationalDate,
	timepoint: HHMM,
	allRules: ScheduleRule[],
	appliedRuleIds: string[],
): ScheduleRule | undefined {
	const rulesById = new Map(allRules.map(rule => [rule._id, rule]));

	for (const id of appliedRuleIds) {
		const rule = rulesById.get(id);
		if (rule?.kind === 'manual' && rule.operating_mode === 'exclude' && rule.timepoints?.includes(timepoint)) {
			return rule;
		}
	}

	for (const id of appliedRuleIds) {
		const rule = rulesById.get(id);
		if (rule?.kind !== 'event_restriction' || !rule.dates?.includes(date)) continue;

		if (getTimepointsRemovedByEventRestriction(rule, [timepoint]).includes(timepoint)) {
			return rule;
		}
	}

	return undefined;
}

/**
 * Normal days: reconcile calendar manuals with {@link computeActiveRules} (P5, ER-01).
 *
 * Calendar-only timepoints removed by event manual excludes or event restrictions become
 * `base_off` pairs so the exporter emits `BASE-OFF-EVENT` instead of plain `BASE`.
 */
function collectNormalDayContributionsReconciled(
	date: OperationalDate,
	allRules: ScheduleRule[],
	monthFilteredManualRules: ManualRule[],
	ctx: DayContext,
	periods: YearPeriod[],
	holidays: Holiday[],
	events?: Event[],
): GtfsIncludeContribution[] {
	const contributions: GtfsIncludeContribution[] = [];
	const operating = computeActiveRules(date, allRules, periods, holidays, { events });
	const operatingTimepoints = new Set(operating.timepoints.map(tp => hhmm(tp)));

	const calendarContributions = collectNormalDayContributions(monthFilteredManualRules, ctx);
	const calendarOperatingByTimepoint = new Map<HHMM, ScheduleRule>();

	for (const contribution of calendarContributions) {
		if (contribution.kind === 'base_off') {
			contributions.push(contribution);
			continue;
		}

		if (contribution.kind === 'operating') {
			calendarOperatingByTimepoint.set(contribution.timepoint, contribution.rule);
		}
	}

	const emittedOperating = new Set<HHMM>();

	for (const [timepoint, ownerRule] of calendarOperatingByTimepoint) {
		if (operatingTimepoints.has(timepoint)) {
			contributions.push({ kind: 'operating', rule: ownerRule, timepoint });
			emittedOperating.add(timepoint);
			continue;
		}

		const excludeRule = findDisplacementExcludeRule(date, timepoint, allRules, operating.appliedRuleIds);
		if (!excludeRule) continue;

		contributions.push({ excludeRule, kind: 'base_off', rule: ownerRule, timepoint });
	}

	const rulesById = new Map(allRules.map(rule => [rule._id, rule]));

	for (const timepoint of operatingTimepoints) {
		if (emittedOperating.has(timepoint)) continue;

		const ownerRule = operating.appliedRuleIds
			.map(id => rulesById.get(id))
			.find((rule): rule is ManualRule =>
				!!rule
				&& rule.kind === 'manual'
				&& rule.operating_mode === 'include'
				&& (rule.timepoints ?? []).includes(timepoint),
			);

		if (ownerRule) {
			contributions.push({ kind: 'operating', rule: ownerRule, timepoint });
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
 * **Same_weekday** — `operating` rows on calendar manual owners (ND-03), one row per timepoint.
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
		// same_weekday (SW-01): one operating owner per timepoint (ND-03), not every rule that
		// intersects the replacement — e.g. ALL_DU + ALL_DU-SAB both match but only ALL_DU owns 21:00.
		for (const timepoint of operatingTimepoints) {
			let ownerRule = calendarOperatingByTimepoint.get(timepoint);

			if (!ownerRule) {
				const candidates = collectReplacementManualIncludesByRule(effectiveReplacement, monthFilteredManualRules)
					.filter(({ timepoints }) => timepoints.some(tp => hhmm(tp) === timepoint))
					.sort((a, b) => compareGeneralManualOwnershipPriority(a.rule, b.rule));

				ownerRule = candidates[0]?.rule;
			}

			if (ownerRule) {
				contributions.push({ kind: 'operating', rule: ownerRule, timepoint });
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
 * - Normal days → {@link collectNormalDayContributionsReconciled}
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
