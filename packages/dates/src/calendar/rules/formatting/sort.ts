/* * */

import { type EventReplacementRule, type ScheduleRule } from '@tmlmobilidade/types';

/* * */

export type RulesSectionName = 'exclude' | 'include' | 'overwrite';

/* * */

function safeStringCompare(a?: string, b?: string) {
	return (a || '').localeCompare(b || '');
}

function getSortedPeriodIds(rule: ScheduleRule): string[] {
	if ('year_period_ids' in rule && Array.isArray(rule.year_period_ids)) {
		return [...rule.year_period_ids].sort((a, b) => a.localeCompare(b));
	}

	return [];
}

function hasAllYearPeriods(rule: ScheduleRule, totalYearPeriods: number): boolean {
	if (!('year_period_ids' in rule) || !Array.isArray(rule.year_period_ids)) {
		return false;
	}

	return totalYearPeriods > 0 && new Set(rule.year_period_ids).size === totalYearPeriods;
}

function getPeriodSortKey(rule: ScheduleRule): string {
	return getSortedPeriodIds(rule).join('|');
}

function normalizeWeekdayValue(weekday: number | string): number {
	if (typeof weekday === 'number') return weekday;

	const numericValue = Number(weekday);

	if (!Number.isNaN(numericValue)) return numericValue;

	return 999;
}

function getSortedWeekdays(rule: ScheduleRule): number[] {
	if ('weekdays' in rule && Array.isArray(rule.weekdays)) {
		return [...rule.weekdays]
			.map(normalizeWeekdayValue)
			.sort((a, b) => a - b);
	}

	return [];
}

function isExactWeekdaySet(rule: ScheduleRule, expected: number[]): boolean {
	const weekdays = getSortedWeekdays(rule);

	if (weekdays.length !== expected.length) return false;

	return weekdays.every((day, index) => day === expected[index]);
}

function getWeekdayGroupPriority(rule: ScheduleRule): number {
	// 1..7 => first
	if (isExactWeekdaySet(rule, [1, 2, 3, 4, 5, 6, 7])) return 0;

	// DU / weekdays only => second
	if (isExactWeekdaySet(rule, [1, 2, 3, 4, 5])) return 1;

	// everything else
	return 2;
}

function getWeekdaySortKey(rule: ScheduleRule): string {
	return getSortedWeekdays(rule)
		.map(day => day.toString().padStart(3, '0'))
		.join('|');
}

function getFirstDate(rule: ScheduleRule): string | undefined {
	if ('dates' in rule && Array.isArray(rule.dates) && rule.dates.length > 0) {
		return [...rule.dates].sort((a, b) => a.localeCompare(b))[0];
	}

	return undefined;
}

function isEventException(rule: ScheduleRule): boolean {
	if (rule.kind === 'event_restriction' || rule.kind === 'event_replacement') {
		return true;
	}

	return rule.kind === 'manual' && Boolean(rule.event_id);
}

function compareByEventDate(a: ScheduleRule, b: ScheduleRule): number {
	const firstDateA = getFirstDate(a) || '99999999';
	const firstDateB = getFirstDate(b) || '99999999';

	const dateComparison = firstDateA.localeCompare(firstDateB);
	if (dateComparison !== 0) return dateComparison;

	return safeStringCompare(a.name, b.name);
}

function compareByRuleParams(
	a: ScheduleRule,
	b: ScheduleRule,
	totalYearPeriods: number,
): number {
	const aHasAllPeriods = hasAllYearPeriods(a, totalYearPeriods);
	const bHasAllPeriods = hasAllYearPeriods(b, totalYearPeriods);

	if (aHasAllPeriods && !bHasAllPeriods) return -1;
	if (!aHasAllPeriods && bHasAllPeriods) return 1;

	const periodComparison = getPeriodSortKey(a).localeCompare(getPeriodSortKey(b));
	if (periodComparison !== 0) return periodComparison;

	const weekdayGroupComparison = getWeekdayGroupPriority(a) - getWeekdayGroupPriority(b);
	if (weekdayGroupComparison !== 0) return weekdayGroupComparison;

	const weekdayComparison = getWeekdaySortKey(a).localeCompare(getWeekdaySortKey(b));
	if (weekdayComparison !== 0) return weekdayComparison;

	return safeStringCompare(a.name, b.name);
}

function compareIncludeExcludeRules(
	a: ScheduleRule,
	b: ScheduleRule,
	totalYearPeriods: number,
): number {
	const aIsEventException = isEventException(a);
	const bIsEventException = isEventException(b);

	if (aIsEventException && !bIsEventException) return 1;
	if (!aIsEventException && bIsEventException) return -1;

	if (aIsEventException && bIsEventException) {
		return compareByEventDate(a, b);
	}

	return compareByRuleParams(a, b, totalYearPeriods);
}

function compareOverwriteRules(a: EventReplacementRule, b: EventReplacementRule): number {
	return compareByEventDate(a, b);
}

/* * */

export function sortRulesBySection(
	rules: ScheduleRule[],
	section: RulesSectionName,
	totalYearPeriods: number,
): ScheduleRule[] {
	const sortedRules = [...rules];

	if (section === 'overwrite') {
		return sortedRules.sort((a, b) =>
			compareOverwriteRules(a as EventReplacementRule, b as EventReplacementRule),
		);
	}

	return sortedRules.sort((a, b) => compareIncludeExcludeRules(a, b, totalYearPeriods));
}
