import type { DayContext } from './types.js';

import { EventReplacementRule, HHMM, ManualRule } from '@tmlmobilidade/types';

import { manualRuleMatchesContext, manualRuleMatchesReplacement } from './matchers.js';

/**
 * Collects time points from manual INCLUDE rules that match a given day context.
 *
 * This is the first phase of rule application for normal (non-replacement) days.
 * Finds all manual rules with operating_mode='include' that match both the weekday
 * and period ID, then aggregates their time points.
 *
 * @param manualRules - Array of all manual rules to check
 * @param ctx - The day context (weekday + period) to match against
 * @returns Object containing the applied rule IDs and the collected time points
 *
 * @example
 * ```ts
 * const result = collectManualIncludes(rules, { weekday: 1, yearPeriodId: 'school' });
 * // result = { appliedRuleIds: ['rule1', 'rule2'], timepoints: Set(['08:00', '09:00']) }
 * ```
 */
export function collectManualIncludes(
	manualRules: ManualRule[],
	ctx: DayContext,
): { appliedRuleIds: string[], timepoints: Set<HHMM> } {
	const timepoints = new Set<HHMM>();
	const appliedRuleIds: string[] = [];

	for (const r of manualRules) {
		if (r.operating_mode !== 'include') continue;
		if (!manualRuleMatchesContext(r, ctx)) continue;

		appliedRuleIds.push(r._id);
		for (const tp of r.timepoints ?? []) timepoints.add(tp);
	}

	return { appliedRuleIds, timepoints };
}

/**
 * Collects time points from manual INCLUDE rules that intersect with a replacement rule.
 *
 * This is the first phase of rule application for days controlled by an event replacement.
 * Uses intersection-based matching: if a manual rule matches ANY of the weekdays/periods
 * targeted by the replacement, its time points are included.
 *
 * The replacement rule itself is always marked as applied (if it has an ID).
 *
 * @param replacement - The event replacement rule controlling this date
 * @param manualRules - Array of all manual rules to check for intersection
 * @returns Object containing the applied rule IDs (including replacement) and collected time points
 *
 * @example
 * ```ts
 * const replacement = { weekdays: [1], year_period_ids: ['school'], _id: 'event1' };
 * const result = collectReplacementManualIncludes(replacement, manualRules);
 * // result.appliedRuleIds will always include 'event1'
 * ```
 */
export function collectReplacementManualIncludes(
	replacement: EventReplacementRule,
	manualRules: ManualRule[],
): { appliedRuleIds: string[], timepoints: Set<HHMM> } {
	const timepoints = new Set<HHMM>();
	const appliedRuleIds: string[] = [];

	// Always mark replacement as applied if it has an id (optional in schema)
	if (replacement._id) appliedRuleIds.push(replacement._id);

	for (const r of manualRules) {
		if (r.operating_mode !== 'include') continue;
		if (!manualRuleMatchesReplacement(r, replacement)) continue;

		if (r._id) appliedRuleIds.push(r._id);
		for (const tp of r.timepoints) timepoints.add(tp as HHMM);
	}

	return { appliedRuleIds, timepoints };
}
