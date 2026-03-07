import type { DayContext } from './types.js';

import { type EventReplacementRule, type ManualRule, type OperationalDate, type ScheduleRule } from '@tmlmobilidade/types';

import { manualRuleMatchesContext, manualRuleMatchesReplacement } from './matchers.js';

/**
 * Removes time points based on manual EXCLUDE rules that match a given day context.
 *
 * This is the second phase of rule application for normal days. Finds all manual rules
 * with operating_mode='exclude' that match the weekday and period, then removes their
 * time points from the collected set.
 *
 * Mutates the timepoints Set and appliedRuleIds array in place.
 *
 * @param timepoints - Set of time points to filter (mutated in place)
 * @param appliedRuleIds - Array to track which rules were applied (mutated in place)
 * @param manualRules - Array of all manual rules to check
 * @param ctx - The day context (weekday + period) to match against
 *
 * @example
 * ```ts
 * const timepoints = new Set(['08:00', '09:00', '10:00']);
 * const appliedRuleIds = ['rule1'];
 * applyManualExcludes(timepoints, appliedRuleIds, rules, { weekday: 1, yearPeriodId: 'school' });
 * // timepoints might now be Set(['08:00', '10:00']) if a rule excluded '09:00'
 * ```
 */
export function applyManualExcludes(
	timepoints: Set<string>,
	appliedRuleIds: string[],
	manualRules: ManualRule[],
	ctx: DayContext,
): void {
	for (const r of manualRules) {
		if (r.operating_mode !== 'exclude') continue;
		if (!manualRuleMatchesContext(r, ctx)) continue;

		appliedRuleIds.push(r._id);

		// If exclude rule has no timepoints, treat as "exclude nothing"
		// (If you want "exclude whole day", add an explicit flag later.)
		for (const tp of r.timepoints ?? []) timepoints.delete(tp);
	}
}

/**
 * Removes time points based on manual EXCLUDE rules that intersect with a replacement rule.
 *
 * This is the second phase of rule application for replacement days. Uses intersection
 * matching: if an exclude rule matches ANY of the weekdays/periods targeted by the
 * replacement, its time points are removed.
 *
 * Mutates the timepoints Set and appliedRuleIds array in place.
 *
 * @param timepoints - Set of time points to filter (mutated in place)
 * @param appliedRuleIds - Array to track which rules were applied (mutated in place)
 * @param replacement - The event replacement rule controlling this date
 * @param manualRules - Array of all manual rules to check for intersection
 */
export function applyReplacementManualExcludes(
	timepoints: Set<string>,
	appliedRuleIds: string[],
	replacement: EventReplacementRule,
	manualRules: ManualRule[],
): void {
	for (const r of manualRules) {
		if (r.operating_mode !== 'exclude') continue;
		if (!manualRuleMatchesReplacement(r, replacement)) continue;

		if (r._id) appliedRuleIds.push(r._id);
		for (const tp of r.timepoints) timepoints.delete(tp);
	}
}

/**
 * Converts HH:MM time string to total minutes since midnight.
 * Helper function for time window calculations.
 *
 * @param hhmm - Time string in HH:MM format (validated by Zod)
 * @returns Total minutes (e.g., "09:30" → 570)
 */
function hhmmToMinutes(hhmm: string): number {
	const [h, m] = hhmm.split(':');
	return Number(h) * 60 + Number(m);
}

/**
 * Removes all time points that fall within a specified time window.
 *
 * Handles midnight crossing: if end < start, the window wraps around midnight
 * and removes times in [start, 24:00) ∪ [00:00, end).
 *
 * Window is inclusive of start, exclusive of end: [start, end)
 *
 * Mutates the timepoints Set in place.
 *
 * @param timepoints - Set of time points to filter (mutated in place)
 * @param startHHMM - Window start time in HH:MM format
 * @param endHHMM - Window end time in HH:MM format
 *
 * @example
 * ```ts
 * const times = new Set(['08:00', '12:00', '22:00', '01:00']);
 * // Remove times between 22:00 and 02:00 (crosses midnight)
 * removeTimePointsByWindow(times, '22:00', '02:00');
 * // times is now Set(['08:00', '12:00'])
 * ```
 */
function removeTimePointsByWindow(
	timepoints: Set<string>,
	startHHMM: string,
	endHHMM: string,
): void {
	const start = hhmmToMinutes(startHHMM);
	const end = hhmmToMinutes(endHHMM);

	const crossesMidnight = end < start;

	for (const tp of Array.from(timepoints)) {
		const t = hhmmToMinutes(tp);

		const inWindow = crossesMidnight
			? (t >= start || t < end)
			: (t >= start && t < end);

		if (inWindow) timepoints.delete(tp);
	}
}

/**
 * Applies event restriction rules to remove time points for a specific date.
 *
 * Event restrictions can work in three modes:
 * 1. all_day: Removes all time points (complete service suspension)
 * 2. explicit timepoints: Removes only the specified times (UI-generated)
 * 3. time window: Removes times within start_time to end_time range (supports midnight crossing)
 *
 * This is the final filtering phase after manual includes/excludes have been processed.
 *
 * Mutates the timepoints Set and appliedRuleIds array in place.
 *
 * @param date - The operational date to check restrictions for
 * @param timepoints - Set of time points to filter (mutated in place)
 * @param appliedRuleIds - Array to track which rules were applied (mutated in place)
 * @param rules - Array of all schedule rules (filters for event_restriction type)
 *
 * @example
 * ```ts
 * const timepoints = new Set(['08:00', '09:00', '10:00']);
 * const appliedRuleIds = [];
 * applyEventRestrictions('2026-12-25', timepoints, appliedRuleIds, rules);
 * // If there's an all_day restriction, timepoints is now Set()
 * ```
 */
export function applyEventRestrictions(
	date: OperationalDate,
	timepoints: Set<string>,
	appliedRuleIds: string[],
	rules: ScheduleRule[],
): void {
	for (const r of rules) {
		if (r.kind !== 'event_restriction') continue;
		if (!r.dates?.includes(date)) continue;

		if (r._id) appliedRuleIds.push(r._id);

		// 1) all day kills everything
		if (r?.all_day) {
			timepoints.clear();
			continue;
		}

		// 2) explicit timepoints removal (UI generated)
		if (r.timepoints?.length) {
			for (const tp of r.timepoints) timepoints.delete(tp);
			continue;
		}

		// 3) fallback: compute from window
		// If start/end exist, remove anything within that time window.
		// If somehow missing, do nothing.
		const start = r?.start_time;
		const end = r?.end_time;

		if (start && end) {
			removeTimePointsByWindow(timepoints, start, end);
		}
	}
}
