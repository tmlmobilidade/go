import type { DayContext, RuleApplication } from './types.js';
import type { Event, EventReplacementRule, EventRestrictionRule, HHMM, Holiday, ManualRule, OperationalDate, ScheduleRule, YearPeriod } from '@tmlmobilidade/types';

import { calendarKey, calendarWeekday } from '@/calendar/utils/index.js';
import { Dates } from '@/dates.js';

import { resolveEffectiveReplacement } from '../export-attribution/replacement.js';
import { findReplacementForDate, getActivePeriodId } from '../utils/date.js';
import { collectManualIncludes, collectReplacementManualIncludes } from './collectors.js';
import { applyEventRestrictions, applyManualExcludes, applyReplacementManualExcludes } from './filters.js';
import { getTimepointsRemovedByEventRestriction } from './filters.js';
import { manualRuleMatchesContext, manualRuleMatchesReplacement } from './matchers.js';

/* * */

export interface ComputeActiveRulesOptions {
	dateContext?: ActiveRulesDateContext
	eventById?: Map<string, Event>
	events?: Event[]
}

export interface ActiveRulesDateContext extends DayContext {
	key: string
}

export interface SplitScheduleRules {
	manualRules: ManualRule[]
	replacementRules: EventReplacementRule[]
	restrictionRules: EventRestrictionRule[]
}

export function buildActiveRulesEventIndex(events: Event[] = []): Map<string, Event> {
	return new Map(events.map(event => [event._id, event]));
}

export function buildActiveRulesDateContext(date: OperationalDate, periods: YearPeriod[], holidays: Holiday[]): ActiveRulesDateContext {
	const key = calendarKey(Dates.fromOperationalDate(date, 'Europe/Lisbon'));
	return {
		key,
		weekday: calendarWeekday(key, holidays),
		yearPeriodId: getActivePeriodId(date, periods),
	};
}

export function splitScheduleRules(rules: ScheduleRule[]): SplitScheduleRules {
	return {
		manualRules: rules.filter((r): r is ManualRule => r.kind === 'manual'),
		replacementRules: rules.filter((r): r is EventReplacementRule => r.kind === 'event_replacement'),
		restrictionRules: rules.filter((r): r is EventRestrictionRule => r.kind === 'event_restriction'),
	};
}

function resolveEventById(id: string, options?: ComputeActiveRulesOptions): Event | undefined {
	return options?.eventById?.get(id) ?? options?.events?.find(event => event._id === id);
}

function filterManualRulesByEventDate(manualRules: ManualRule[], date: OperationalDate, options?: ComputeActiveRulesOptions) {
	return manualRules.filter((rule) => {
		if (!rule.event_id) return true;
		const event = resolveEventById(rule.event_id, options);
		if (!event?.dates?.length) return false;
		return event.dates.includes(date);
	});
}

function filterManualRulesByMonth(manualRules: ManualRule[], month: number) {
	return manualRules.filter(rule =>
		!rule.months?.length || (rule.months as number[]).includes(month),
	);
}

function collectManualIncludeTimepoints(manualRules: ManualRule[], ctx: DayContext): Set<HHMM> {
	const timepoints = new Set<HHMM>();

	for (const rule of manualRules) {
		if (rule.operating_mode !== 'include') continue;
		if (!manualRuleMatchesContext(rule, ctx)) continue;

		for (const timepoint of rule.timepoints ?? []) timepoints.add(timepoint);
	}

	return timepoints;
}

function collectReplacementManualIncludeTimepoints(replacement: EventReplacementRule, manualRules: ManualRule[]): Set<HHMM> {
	const timepoints = new Set<HHMM>();

	for (const rule of manualRules) {
		if (rule.operating_mode !== 'include') continue;
		if (!manualRuleMatchesReplacement(rule, replacement)) continue;

		for (const timepoint of rule.timepoints) timepoints.add(timepoint as HHMM);
	}

	return timepoints;
}

function applyManualExcludeTimepoints(timepoints: Set<HHMM>, manualRules: ManualRule[], ctx: DayContext): void {
	for (const rule of manualRules) {
		if (rule.operating_mode !== 'exclude') continue;
		if (!manualRuleMatchesContext(rule, ctx)) continue;

		for (const timepoint of rule.timepoints ?? []) timepoints.delete(timepoint);
	}
}

function applyReplacementManualExcludeTimepoints(timepoints: Set<HHMM>, replacement: EventReplacementRule, manualRules: ManualRule[]): void {
	for (const rule of manualRules) {
		if (rule.operating_mode !== 'exclude') continue;
		if (!manualRuleMatchesReplacement(rule, replacement)) continue;

		for (const timepoint of rule.timepoints) timepoints.delete(timepoint);
	}
}

function applyEventRestrictionTimepoints(date: OperationalDate, timepoints: Set<HHMM>, rules: EventRestrictionRule[]): void {
	for (const rule of rules) {
		if (!rule.dates?.includes(date)) continue;

		for (const timepoint of getTimepointsRemovedByEventRestriction(rule, timepoints)) {
			timepoints.delete(timepoint);
		}
	}
}

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
	options?: ComputeActiveRulesOptions,
): RuleApplication {
	const splitRules = splitScheduleRules(rules);
	return computeActiveRulesFromSplit(date, splitRules, periods, holidays, options);
}

export function computeActiveRulesFromSplit(
	date: OperationalDate,
	rules: SplitScheduleRules,
	periods: YearPeriod[],
	holidays: Holiday[],
	options?: ComputeActiveRulesOptions,
): RuleApplication {
	const { manualRules, replacementRules, restrictionRules } = rules;

	const filteredManualRules = filterManualRulesByEventDate(manualRules, date, options);

	const key = options?.dateContext?.key ?? calendarKey(Dates.fromOperationalDate(date, 'Europe/Lisbon'));

	// Filter out manual rules whose months list doesn't include the current month
	const month = Number(key.slice(5, 7));
	const monthFilteredManualRules = filterManualRulesByMonth(filteredManualRules, month);

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
		const ctx = options?.dateContext ?? buildActiveRulesDateContext(date, periods, holidays);

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

export function computeActiveRuleCountFromSplit(
	date: OperationalDate,
	rules: SplitScheduleRules,
	periods: YearPeriod[],
	holidays: Holiday[],
	options?: ComputeActiveRulesOptions,
): number {
	const filteredManualRules = filterManualRulesByEventDate(rules.manualRules, date, options);

	const key = options?.dateContext?.key ?? calendarKey(Dates.fromOperationalDate(date, 'Europe/Lisbon'));

	const month = Number(key.slice(5, 7));
	const monthFilteredManualRules = filterManualRulesByMonth(filteredManualRules, month);

	const replacement = findReplacementForDate(date, rules.replacementRules);

	let timepoints: Set<HHMM>;

	if (replacement) {
		const effectiveReplacement = resolveEffectiveReplacement(date, replacement, holidays);

		timepoints = collectReplacementManualIncludeTimepoints(effectiveReplacement, monthFilteredManualRules);

		applyReplacementManualExcludeTimepoints(timepoints, effectiveReplacement, monthFilteredManualRules);
	} else {
		const ctx = options?.dateContext ?? buildActiveRulesDateContext(date, periods, holidays);

		timepoints = collectManualIncludeTimepoints(monthFilteredManualRules, ctx);

		applyManualExcludeTimepoints(timepoints, monthFilteredManualRules, ctx);
	}

	applyEventRestrictionTimepoints(date, timepoints, rules.restrictionRules);

	return timepoints.size;
}

/* * */
