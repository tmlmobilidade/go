import { type EventReplacementDefinition, type ManualRule, type StopsParameterOverride, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { getCompactMonthOptions, getCompactWeekdayOptions } from '@tmlmobilidade/go-utils-dates';
import { type TFunction } from 'i18next';

import { getDayPeriodLabels } from '../../day-period-labels.js';
import { schedulingList, schedulingMessage } from './messages.js';

/* * */

type SchedulingConditions = EventReplacementDefinition | ManualRule | StopsParameterOverride;
interface SummaryFormat { locale: string, mode: 'long' | 'short', omitIfAll?: boolean, t: TFunction }
type CompactSummaryFormat = Omit<SummaryFormat, 'mode'>;

/** Format selected Period names. All-period detection uses the caller's relevant Period set. */
export function buildYearPeriodsPart(
	rule: SchedulingConditions,
	options: { locale: string, periods?: YearPeriod[], t: TFunction },
	cfg: { omitIfAll?: boolean } = {},
): string {
	const { t } = options;
	const allPeriodIds = options.periods?.map(period => period._id) ?? [];
	const selectedPeriodIds = [...new Set(rule.year_period_ids ?? [])];
	const isAll = allPeriodIds.length > 0 && selectedPeriodIds.length === allPeriodIds.length && allPeriodIds.every(id => selectedPeriodIds.includes(id));

	if (!selectedPeriodIds.length || isAll) {
		if (cfg.omitIfAll) return '';
		return schedulingMessage(t, 'allPeriods');
	}

	const periods = selectedPeriodIds.map(id => options.periods?.find(period => period._id === id));
	const labels = periods.map((period) => {
		if (!period) return schedulingMessage(t, 'unknownPeriod');
		return periods.length === 1 ? period.name : period.short_name?.trim() || period.name;
	});
	// Repeated abbreviations cannot distinguish selected Periods; retain their full names.
	const distinctLabels = labels.map((label, index) => labels.indexOf(label) !== labels.lastIndexOf(label) ? periods[index]?.name ?? label : label);
	return schedulingList(options.locale, distinctLabels);
}

/** Scheduling Sunday includes holidays; the underlying ISO weekday model remains generic. */
export function getSchedulingWeekdayOptions(locale: string, t: TFunction) {
	return getCompactWeekdayOptions(locale).map(option => ({
		...option,
		label: option.value === 7 ? schedulingMessage(t, 'sundayAndHolidays', { day: option.label }) : option.label,
	}));
}

/** Retains the existing weekday/weekend grouping without changing holiday scheduling policy. */
export function buildWeekdaysPart(rule: SchedulingConditions, cfg: CompactSummaryFormat): string {
	const days = [...new Set(rule.weekdays ?? [])].sort((a, b) => a - b);
	const { locale, t } = cfg;
	if (!days.length || days.length === 7) {
		if (cfg.omitIfAll) return '';
		return schedulingMessage(t, 'allDays');
	}

	const options = getSchedulingWeekdayOptions(locale, t);
	const label = (day: number) => options.find(option => option.value === day)?.label ?? String(day);
	const hasBusinessDays = [1, 2, 3, 4, 5].every(day => days.some(selected => selected === day));
	const hasWeekend = days.includes(6) && days.includes(7);
	if (hasBusinessDays || hasWeekend) {
		const group = hasBusinessDays ? [1, 2, 3, 4, 5] : [6, 7];
		const extras = days.filter(day => !group.includes(day)).map(label);
		const key = hasBusinessDays ? 'businessDays' : 'weekend';
		const base = schedulingMessage(t, key);
		return extras.length ? `${base} + ${schedulingList(locale, extras)}` : base;
	}

	const names = schedulingList(locale, days.map(label));
	return names;
}

export function buildDayPeriodsPart(parameter: StopsParameterOverride, cfg: SummaryFormat): string {
	const selected = parameter.day_periods ?? [];
	if (!selected.length) return schedulingMessage(cfg.t, 'allDay');
	const dayPeriodLabels = getDayPeriodLabels(cfg.t);
	const labels = selected.map(period => dayPeriodLabels[period][cfg.mode]);
	if (cfg.mode === 'short') return labels.join(' · ');
	return schedulingMessage(cfg.t, 'duringDayPeriods', { names: schedulingList(cfg.locale, labels) });
}

export function buildMonthsPart(rule: Pick<ManualRule, 'months'>, cfg: CompactSummaryFormat): string {
	if (!rule.months?.length || new Set(rule.months).size === 12) {
		if (cfg.omitIfAll) return '';
		return schedulingMessage(cfg.t, 'allMonths');
	}
	const months = getCompactMonthOptions(cfg.locale).filter(option => rule.months?.includes(option.value));
	const ranges: string[] = [];

	for (let start = 0; start < months.length;) {
		let end = start;
		while (end + 1 < months.length && months[end + 1].value === months[end].value + 1) end++;
		ranges.push(start === end ? months[start].label : `${months[start].label}–${months[end].label}`);
		start = end + 1;
	}

	return ranges.join(', ');
}
