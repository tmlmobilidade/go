import type { DayContext } from './types.js';

import { EventReplacementRule, ManualRule } from '@tmlmobilidade/types';

/**
 * Determines if a manual rule matches the given day context.
 *
 * Uses strict AND logic: the rule must include BOTH the specified weekday
 * AND the period ID to match. This is used for normal (non-replacement) days.
 *
 * @param rule - The manual rule to check
 * @param ctx - The day context containing the weekday and period ID
 * @returns True if the rule applies to this day context
 *
 * @example
 * ```ts
 * const rule = { weekdays: [1, 2, 3], year_period_ids: ['school'], ... };
 * const ctx = { weekday: 1, yearPeriodId: 'school' };
 * manualRuleMatchesContext(rule, ctx); // true
 * ```
 */
export function manualRuleMatchesContext(rule: ManualRule, ctx: DayContext): boolean {
	if (rule.event_id) {
		// Event-exception rules: date matching already done by filteredManualRules in computeActiveRules.
		// If weekdays is non-empty, the user narrowed the event to specific days — check it.
		const weekdays = rule.weekdays ?? [];
		const yearPeriodIds = rule.year_period_ids ?? [];
		if (weekdays.length > 0 && !weekdays.includes(ctx.weekday)) return false;
		// If year_period_ids is non-empty, the user narrowed the event to specific periods — check it.
		if (yearPeriodIds.length > 0 && !yearPeriodIds.includes(ctx.yearPeriodId)) return false;
		return true;
	}

	// Strict by design: rule must include the weekday and the yearPeriodId.
	return rule.weekdays.includes(ctx.weekday) && rule.year_period_ids.includes(ctx.yearPeriodId);
}

/**
 * Checks if two arrays have at least one element in common.
 * Helper function for intersection-based matching.
 *
 * @param a - First array
 * @param b - Second array
 * @returns True if arrays have any common elements
 */
function intersects<T>(a: readonly T[] | undefined, b: readonly T[] | undefined): boolean {
	if (!a?.length || !b?.length) return false;

	const setA = new Set(a);
	for (const x of b) if (setA.has(x)) return true;
	return false;
}

/**
 * Determines if a manual rule intersects with an event replacement rule's targets.
 *
 * Uses OR logic via set intersection: if the rule matches ANY weekday or period
 * that the replacement targets, it's considered a match. This is used when a
 * replacement rule overrides the normal schedule for certain weekdays/periods.
 *
 * @param rule - The manual rule to check
 * @param replacement - The event replacement rule defining override targets
 * @returns True if the rule intersects with the replacement's targets
 *
 * @example
 * ```ts
 * const rule = { weekdays: [1, 2], year_period_ids: ['school'], ... };
 * const replacement = { weekdays: [1], year_period_ids: ['school', 'summer'], ... };
 * manualRuleMatchesReplacement(rule, replacement); // true (weekday 1 matches)
 * ```
 */
export function manualRuleMatchesReplacement(rule: ManualRule, replacement: EventReplacementRule): boolean {
	return (
		intersects(rule.weekdays, replacement.weekdays)
		&& intersects(rule.year_period_ids, replacement.year_period_ids)
	);
}
