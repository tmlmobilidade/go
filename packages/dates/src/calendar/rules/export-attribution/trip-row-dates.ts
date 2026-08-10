import type { Event, Holiday, OperationalDate, ScheduleRule, YearPeriod } from '@tmlmobilidade/types';

import { buildCanonicalRuleDates } from './canonical-registry.js';

export type CanonicalDateCache = Map<string, Set<OperationalDate>>;

export interface ExcludeScheduleSlice {
	dates: Set<OperationalDate>
	rule: ScheduleRule
}

export interface SplitByExcludeOverlapResult {
	offOperationalDates: Set<OperationalDate>
	overlappingExcludeSchedules: ExcludeScheduleSlice[]
	plainOperationalDates: Set<OperationalDate>
}

/**
 * Splits accumulated include dates into plain vs OFF buckets by **per-date** exclude overlap.
 *
 * Without this split, a single displacement day (e.g. Santo António, Véspera de Natal) marks the
 * entire rule×timepoint schedule as OFF and forces canonical expansion for all dates — including
 * same-weekday replacement days that should stay plain (SW-01, ND-04).
 */
export function splitOperationalDatesByExcludeOverlap(
	includeDates: Set<OperationalDate>,
	includeRuleId: string | undefined,
	excludeSchedules: ExcludeScheduleSlice[],
): SplitByExcludeOverlapResult {
	const plainOperationalDates = new Set<OperationalDate>();
	const offOperationalDates = new Set<OperationalDate>();
	const overlappingById = new Map<string, ExcludeScheduleSlice>();

	for (const date of includeDates) {
		const overlapping = excludeSchedules.filter(
			ex => ex.rule._id !== includeRuleId && ex.dates.has(date),
		);

		if (overlapping.length === 0) {
			plainOperationalDates.add(date);
			continue;
		}

		offOperationalDates.add(date);

		for (const ex of overlapping) {
			const id = ex.rule._id ?? '';
			if (!overlappingById.has(id)) overlappingById.set(id, ex);
		}
	}

	return {
		offOperationalDates,
		overlappingExcludeSchedules: [...overlappingById.values()],
		plainOperationalDates,
	};
}

export function resolveCanonicalDatesForRule(
	rule: ScheduleRule,
	accumulated: Set<OperationalDate>,
	cache: CanonicalDateCache,
	exportDates: readonly OperationalDate[],
	registryOptions: { events: Event[], holidays: Holiday[], periods: YearPeriod[] },
): Set<OperationalDate> {
	if (rule.kind !== 'manual' && rule.kind !== 'event_replacement') {
		return accumulated;
	}

	if (!cache.has(rule._id)) {
		cache.set(
			rule._id,
			buildCanonicalRuleDates(rule, exportDates, registryOptions),
		);
	}

	const canonical = cache.get(rule._id);
	return canonical?.size ? canonical : accumulated;
}

/**
 * Resolves calendar membership for an OFF include row (canonical base minus canonical excludes).
 *
 * `allIncludeAccumulated` — union of all accumulated dates for this include rule at this
 * timepoint (plain + off). Canonical expansion of the base rule can include dates the rule
 * never actually accumulated on — e.g. Easter dates leak into a JUN_U2_SEM OFF row because
 * Easter is within the same year-period, but the event_replacement redirected the rule away
 * from that timepoint on Easter. Capping to accumulated dates prevents those phantoms.
 */
export function computeOffRowDates(
	includeRule: ScheduleRule,
	overlappingExcludeSchedules: ExcludeScheduleSlice[],
	canonicalCache: CanonicalDateCache,
	exportDates: readonly OperationalDate[],
	registryOptions: { events: Event[], holidays: Holiday[], periods: YearPeriod[] },
	offOperationalDates: Set<OperationalDate>,
	allIncludeAccumulated?: Set<OperationalDate>,
): Set<OperationalDate> {
	// Defensive copy: resolveCanonicalDatesForRule returns the cached Set directly, and we
	// mutate below. Without a copy, repeated calls for the same rule (different timepoints)
	// would start from a previously-reduced canonical.
	const resultingDates = new Set(resolveCanonicalDatesForRule(
		includeRule,
		offOperationalDates,
		canonicalCache,
		exportDates,
		registryOptions,
	));

	for (const excludeSchedule of overlappingExcludeSchedules) {
		const excludeDates = resolveCanonicalDatesForRule(
			excludeSchedule.rule,
			excludeSchedule.dates,
			canonicalCache,
			exportDates,
			registryOptions,
		);

		for (const excludedDate of excludeDates) {
			resultingDates.delete(excludedDate);
		}
	}

	// Cap to dates the include rule actually accumulated. Dates in canonical but not accumulated
	// were redirected away (e.g. by event_replacement) and must not appear in the OFF row.
	if (allIncludeAccumulated) {
		for (const date of resultingDates) {
			if (!allIncludeAccumulated.has(date)) resultingDates.delete(date);
		}
	}

	return resultingDates;
}
