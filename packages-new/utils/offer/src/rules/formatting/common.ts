import { type EventReplacementRule, type ManualRule, type StopsParameterOverride, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { getMonthOptions, getWeekdayOptions } from '@tmlmobilidade/go-utils-dates';
import { type TFunction } from 'i18next';

import { getDayPeriodLabels } from '../../day-period-labels.js';
import { schedulingList, schedulingMessage } from './messages.js';

/* * */

type SchedulingConditions = EventReplacementRule | ManualRule | StopsParameterOverride;
interface SummaryFormat { locale: string, mode: 'long' | 'short', omitIfAll?: boolean, t: TFunction }

/** Format selected Period names. All-period detection uses the caller's relevant Period set. */
export function buildYearPeriodsPart(
	rule: SchedulingConditions,
	options: { locale: string, periods?: YearPeriod[], t: TFunction },
	cfg: { mode: 'long' | 'short', omitIfAll?: boolean },
): string {
	const { locale, t } = options;
	const allPeriodIds = options.periods?.map(period => period._id) ?? [];
	const selectedPeriodIds = [...new Set(rule.year_period_ids ?? [])];
	const isAll = allPeriodIds.length > 0 && selectedPeriodIds.length === allPeriodIds.length && allPeriodIds.every(id => selectedPeriodIds.includes(id));

	if (!selectedPeriodIds.length || isAll) {
		if (cfg.omitIfAll) return '';
		return schedulingMessage(t, cfg.mode === 'short' ? 'allPeriods' : 'inAllPeriods');
	}

	const labels = selectedPeriodIds.map(id => options.periods?.find(period => period._id === id)?.name ?? schedulingMessage(t, 'unknownPeriod'));
	if (cfg.mode === 'short') return labels.length === 1 ? labels[0] : schedulingMessage(t, 'periodCount', { count: labels.length });
	return schedulingMessage(t, labels.length === 1 ? 'duringPeriod' : 'duringPeriods', { names: schedulingList(locale, labels) });
}

/** Scheduling Sunday includes holidays; the underlying ISO weekday model remains generic. */
export function getSchedulingWeekdayOptions(locale: string, t: TFunction) {
	return getWeekdayOptions(locale).map(option => ({
		...option,
		label: option.value === 7 ? schedulingMessage(t, 'sundayAndHolidays', { day: option.label }) : option.label,
	}));
}

/** Retains the existing weekday/weekend grouping without changing holiday scheduling policy. */
export function buildWeekdaysPart(rule: SchedulingConditions, cfg: SummaryFormat): string {
	const days = [...new Set(rule.weekdays ?? [])].sort((a, b) => a - b);
	const { locale, t } = cfg;
	if (!days.length || days.length === 7) {
		if (cfg.omitIfAll) return '';
		return schedulingMessage(t, cfg.mode === 'short' ? 'allDays' : 'onAllDays');
	}

	const options = getSchedulingWeekdayOptions(locale, t);
	const label = (day: number) => options.find(option => option.value === day)?.label ?? String(day);
	const hasBusinessDays = [1, 2, 3, 4, 5].every(day => days.some(selected => selected === day));
	const hasWeekend = days.includes(6) && days.includes(7);
	if (hasBusinessDays || hasWeekend) {
		const group = hasBusinessDays ? [1, 2, 3, 4, 5] : [6, 7];
		const extras = days.filter(day => !group.includes(day)).map(label);
		const key = hasBusinessDays
			? (cfg.mode === 'short' ? 'businessDays' : 'onBusinessDays')
			: (cfg.mode === 'short' ? 'weekend' : 'onWeekend');
		const base = schedulingMessage(t, key);
		return extras.length ? `${base} + ${schedulingList(locale, extras)}` : base;
	}

	const names = schedulingList(locale, days.map(label));
	return cfg.mode === 'short' ? names : schedulingMessage(t, 'onDays', { names });
}

export function buildDayPeriodsPart(parameter: StopsParameterOverride, cfg: SummaryFormat): string {
	const selected = parameter.day_periods ?? [];
	if (!selected.length) return schedulingMessage(cfg.t, 'allDay');
	const dayPeriodLabels = getDayPeriodLabels(cfg.t);
	const labels = selected.map(period => dayPeriodLabels[period][cfg.mode]);
	if (cfg.mode === 'short') return labels.join(' · ');
	return schedulingMessage(cfg.t, 'duringDayPeriods', { names: schedulingList(cfg.locale, labels) });
}

export function buildMonthsPart(rule: Pick<ManualRule, 'months'>, cfg: SummaryFormat): string {
	if (!rule.months?.length || new Set(rule.months).size === 12) {
		if (cfg.omitIfAll) return '';
		return schedulingMessage(cfg.t, cfg.mode === 'short' ? 'allMonths' : 'inAllMonths');
	}
	const labels = getMonthOptions(cfg.locale).filter(option => rule.months?.includes(option.value)).map(option => option.label);
	if (cfg.mode === 'short') return labels.length === 1 ? labels[0] : schedulingMessage(cfg.t, 'monthCount', { count: labels.length });
	return schedulingList(cfg.locale, labels);
}
