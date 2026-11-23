import type { DayContext } from '../calculation/types.js';
import type { GtfsIncludeContribution } from './types.js';

import { type Holiday } from '@tmlmobilidade/go-types-dates';
import { type Event, type HHMM, hhmm, type ManualRule, type ScheduleRule, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

import { getTimepointsRemovedByEventRestriction } from '../calculation/filters.js';
import { computeActiveRules } from '../calculation/index.js';
import { collectManualIncludesByRule } from './collectors.js';
import { compareGeneralManualOwnershipPriority } from './manual-ownership.js';

/* * */

/**
 * Non-replacement days: assign each matching timepoint to one `operating` rule.
 *
 * Event-specific manuals claim first; general manuals follow {@link compareGeneralManualOwnershipPriority}.
 * When two generals share a timepoint, only one `operating` row is emitted (ND-03).
 * When an event manual displaces a general on the same timepoint, emits `base_off` (ND-02).
 */
export function collectNormalDayContributions(
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
	date: OperationalDateInt,
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
export function collectNormalDayContributionsReconciled(
	date: OperationalDateInt,
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

