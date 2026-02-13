import type { OperationalDate, Period, ScheduleRule } from '@tmlmobilidade/types';

import { calendarKey, type CalendarKey, Dates } from '@tmlmobilidade/dates';

import { calculateRuleApplications } from '../calculation';
import { buildOperationalDateRange } from '../utils/date';

/**
 * Preview data structure containing rule application results for a date range.
 * Used by UI components to display calendar views and schedule grids.
 */
export interface RulesPreview {
	/** Full rule applications map with metadata */
	applications: ReturnType<typeof calculateRuleApplications>
	/** Simplified map of date → active time points */
	byDate: Map<CalendarKey, string[]>
	/** Array of dates that have active time points or event overrides */
	dates: CalendarKey[]
}

/**
 * Builds a preview of rule applications for a date range.
 *
 * Generates the full schedule for each date in the range, then filters to only
 * include dates that have active time points or are controlled by event overrides.
 * Used by calendar components to visualize which dates have service.
 *
 * @param rules - All scheduling rules to apply
 * @param periods - Period definitions for context resolution
 * @param opts - Date range options (startDate and endDate as JavaScript Dates)
 * @returns RulesPreview with applications, byDate map, and filtered dates array
 *
 * @example
 * ```ts
 * const preview = buildRulesPreview(rules, periods, {
 *   startDate: new Date('2026-02-01'),
 *   endDate: new Date('2026-02-28')
 * });
 * // preview.dates contains only CalendarKeys with active service
 * // preview.byDate maps each date to its time points
 * ```
 */
export function buildRulesPreview(
	rules: ScheduleRule[],
	periods: Period[],
	opts: { endDate: Date, startDate: Date },
): RulesPreview {
	console.log('Building rules preview with options:', opts);

	const dateRange = buildOperationalDateRange(opts.startDate, opts.endDate);

	const applications = calculateRuleApplications(rules, dateRange, periods);

	const byDate = new Map<CalendarKey, string[]>();
	const dates: CalendarKey[] = [];

	for (const opDate of dateRange) {
		const key = calendarKey(Dates.fromOperationalDate(opDate, 'Europe/Lisbon'));
		const app = applications.get(key);

		if (!app) continue;

		const hasAny = app.timePoints.length > 0;
		const shouldShow = hasAny || app.isEventOverride;

		if (shouldShow) {
			dates.push(key);
			byDate.set(key, app.timePoints);
		}
	}

	return { applications, byDate, dates };
}

/**
 * Represents the visual impact of a rule on the schedule.
 * Used to determine which icons/markers to show in schedule grid UI.
 */
export interface RuleImpact {
	/** Time points that this rule adds or defines (shown as filled icons) */
	filled: Set<string>
	/** Time points that this rule removes (shown as outlined icons) */
	outlined: Set<string>
}

/**
 * Computes the visual impact of a single rule for display in schedule grid columns.
 *
 * The algorithm differs based on rule type:
 *
 * **Manual rules (include/exclude):**
 * - Simple and fast - uses the rule's timePoints directly
 * - Include rules: all timePoints → filled
 * - Exclude rules: all timePoints → outlined
 *
 * **Event rules (replacement/restriction):**
 * - Diff-based - compares schedules with/without this rule
 * - Filled = times added by this rule (A \ B)
 * - Outlined = times removed by this rule (B \ A)
 * - Special case for replacements: show final schedule only (filled, no outlined)
 *
 * @param rule - The rule to analyze
 * @param allRules - Complete set of rules for diff calculation
 * @param periods - Period definitions for context resolution
 * @param dateRange - Date range to analyze (typically 1 year for performance)
 * @returns RuleImpact with filled and outlined time point sets
 *
 * @example
 * ```ts
 * const impact = computeRuleImpactTimePoints(rule, allRules, periods, dateRange);
 * // For manual include: impact = { filled: Set(['08:00', '09:00']), outlined: Set() }
 * // For restriction: impact = { filled: Set(), outlined: Set(['12:00']) }
 * // For replacement: impact = { filled: Set([all final times]), outlined: Set() }
 * ```
 */
export function computeRuleImpactTimePoints(
	rule: ScheduleRule,
	allRules: ScheduleRule[],
	periods: Period[],
	dateRange: OperationalDate[], // usually the preview window, e.g. 1 year
): RuleImpact {
	// Manual rules are explicit by definition.
	if (rule.kind === 'manual') {
		const tps = new Set(rule.timePoints ?? []);
		return rule.operatingMode === 'include'
			? { filled: tps, outlined: new Set() }
			: { filled: new Set(), outlined: tps };
	}

	// Event rules: only care about the dates they apply to
	const dates = rule.dates ?? [];
	if (!dates.length) return { filled: new Set(), outlined: new Set() };

	const relevantDates = new Set(dates);
	const filteredRange = dateRange.filter(d => relevantDates.has(d));

	if (!filteredRange.length) return { filled: new Set(), outlined: new Set() };

	// Applications with all rules
	const withAll = calculateRuleApplications(allRules, filteredRange, periods);

	// Applications without this rule
	const withoutRule = calculateRuleApplications(
		allRules.filter(r => r._id !== rule._id),
		filteredRange,
		periods,
	);

	const filled = new Set<string>();
	const outlined = new Set<string>();

	for (const opDate of filteredRange) {
		const key = calendarKey(Dates.fromOperationalDate(opDate, 'Europe/Lisbon'));
		const a = withAll.get(key);
		const b = withoutRule.get(key);

		const A = new Set(a?.timePoints ?? []);
		const B = new Set(b?.timePoints ?? []);

		// diff
		// added = A \ B
		for (const tp of A) if (!B.has(tp)) filled.add(tp);

		// removed = B \ A
		for (const tp of B) if (!A.has(tp)) outlined.add(tp);

		// Replacement semantics: show the *final* schedule on those dates (not just delta).
		if (rule.kind === 'event_replacement') {
			filled.clear();
			for (const tp of A) filled.add(tp);
			outlined.clear(); // replacement column is filled-only
		}
	}

	return { filled, outlined };
}
