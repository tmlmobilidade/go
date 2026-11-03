import { Event, EventReplacementRule, EventRestrictionRule, ManualRule, ScheduleRule, YearPeriod } from '@tmlmobilidade/go-types-offer';
import { OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { type TFunction } from 'i18next';

import { buildMonthsPart, buildWeekdaysPart, buildYearPeriodsPart } from './common.js';
import { getSchedulingWeekdayOptions } from './common.js';
import { schedulingMessage } from './messages.js';

/**
 * Human-readable summary of a rule in multiple formats.
 * Used for displaying rule information in UI components.
 */
export interface RuleSummary {
	/** Full descriptive text (e.g., "Durante o Período Escolar, nos dias úteis") */
	long: string
	/** Compact label (e.g., "Dias úteis · Período Escolar") */
	short: string
	/** Detailed tooltip with event dates/times if applicable */
	tooltip: string
}

/**
 * Builds human-readable summaries of a scheduling rule.
 *
 * Generates three text formats optimized for different UI contexts:
 * - **short**: Compact label for badges/pills (e.g., "Dias úteis · Período Escolar")
 * - **long**: Full description for tooltips (e.g., "Durante o Período Escolar, nos dias úteis")
 * - **tooltip**: Detailed event information with dates and times
 */
export function buildRuleSummary(
	rule: ScheduleRule,
	options: {
		events?: Event[]
		locale: string
		periods?: YearPeriod[]
		t: TFunction
	},
): RuleSummary {
	return {
		long: buildRuleSummaryLong(rule, options),
		short: buildRuleSummaryShort(rule, options),
		tooltip: buildRuleSummaryTooltip(rule, options),
	};
}

/**
 * Type guard for event restriction rules.
 */
const isEventRestriction = (r: ScheduleRule): r is EventRestrictionRule => r.kind === 'event_restriction';

/**
 * Type guard for event replacement rules.
 */
const isEventReplacement = (r: ScheduleRule): r is EventReplacementRule => r.kind === 'event_replacement';

const getEventForManualRule = (rule: ManualRule, events?: Event[]) => {
	if (!rule.event_id) return undefined;
	return events?.find(event => event._id === rule.event_id);
};

/* ---------------- helpers ---------------- */

function dateMatchesWeekdays(date: OperationalDateInt, weekdays?: number[]): boolean {
	if (!weekdays?.length) return true;

	const jsDay = dateAsUtc(date).getUTCDay();
	const isoWeekday = (jsDay === 0 ? 7 : jsDay) as number;

	return weekdays.includes(isoWeekday);
}

function dateMatchesPeriods(
	date: OperationalDateInt,
	yearPeriodIds: string[] | undefined,
	periods?: YearPeriod[],
): boolean {
	if (!yearPeriodIds?.length) return true;

	const allowedDates = new Set(
		periods
			?.filter(p => yearPeriodIds.includes(p._id))
			.flatMap(p => p.dates ?? []) ?? [],
	);

	return allowedDates.has(date);
}

/**
 * Builds the short summary format for a rule.
 *
 * Event restriction / replacement rules: event title
 * Manual rules:
 * - event-based: "Event · Period · Weekdays"
 * - normal: "Period · Weekdays"
 */
function buildRuleSummaryShort(
	rule: ScheduleRule,
	options: { events?: Event[], locale: string, periods?: YearPeriod[], t: TFunction },
): string {
	if (isEventRestriction(rule)) {
		return rule.event?.title ?? '';
	}

	if (isEventReplacement(rule)) {
		return rule.event?.title ?? '';
	}

	if (rule.kind === 'manual' && rule.event_id) {
		const title = getEventForManualRule(rule, options?.events)?.title ?? '';
		const periodPart = rule.year_period_ids?.length ? buildYearPeriodsPart(rule, options, { mode: 'short', omitIfAll: true }) : '';
		const monthsPart = buildMonthsPart(rule, { locale: options.locale, mode: 'short', omitIfAll: true, t: options.t });
		const weekdayPart = buildWeekdaysPart(rule, { locale: options.locale, mode: 'short', omitIfAll: true, t: options.t });
		return [title, periodPart, monthsPart, weekdayPart].filter(Boolean).join(' · ');
	}

	// manual
	const parts: string[] = [];

	const periodPart = buildYearPeriodsPart(rule, options, { mode: 'short' });
	if (periodPart) parts.push(periodPart);

	const monthsPart = buildMonthsPart(rule, { locale: options.locale, mode: 'short', omitIfAll: true, t: options.t });
	if (monthsPart) parts.push(monthsPart);

	const weekdayPart = buildWeekdaysPart(rule, { locale: options.locale, mode: 'short', t: options.t });
	if (weekdayPart) parts.push(weekdayPart);

	return parts.join(' · ');
}

/**
 * Builds the long summary format for a rule.
 *
 * Event restriction / replacement rules: event title
 * Manual rules:
 * - event-based: "Event, Period, Weekdays"
 * - normal: "Period, Weekdays"
 */
function buildRuleSummaryLong(
	rule: ScheduleRule,
	options: { events?: Event[], locale: string, periods?: YearPeriod[], t: TFunction },
): string {
	if (isEventReplacement(rule) || isEventRestriction(rule)) {
		return rule.event?.title ?? '';
	}

	if (rule.kind === 'manual' && rule.event_id) {
		const title = getEventForManualRule(rule, options?.events)?.title ?? '';
		const periodPart = rule.year_period_ids?.length ? buildYearPeriodsPart(rule, options, { mode: 'long', omitIfAll: true }) : '';
		const monthsPart = buildMonthsPart(rule, { locale: options.locale, mode: 'long', omitIfAll: true, t: options.t });
		const weekdayPart = buildWeekdaysPart(rule, { locale: options.locale, mode: 'long', omitIfAll: true, t: options.t });
		return [title, periodPart, monthsPart, weekdayPart].filter(Boolean).join(', ');
	}

	// manual
	const parts: string[] = [];

	const periodPart = buildYearPeriodsPart(rule, options, { mode: 'long' });
	if (periodPart) parts.push(periodPart);

	const monthsPart = buildMonthsPart(rule, { locale: options.locale, mode: 'long', omitIfAll: true, t: options.t });
	if (monthsPart) parts.push(monthsPart);

	const weekdayPart = buildWeekdaysPart(rule, { locale: options.locale, mode: 'long', t: options.t });
	if (weekdayPart) parts.push(weekdayPart);

	return parts.join(', ');
}

/**
 * Formats a date with weekday indicator.
 * Example: "20/01/2025 (Sáb)"
 */
function dateAsUtc(date: OperationalDateInt): Date {
	const text = String(date);
	return new Date(Date.UTC(Number(text.slice(0, 4)), Number(text.slice(4, 6)) - 1, Number(text.slice(6, 8))));
}

function formatDateWithWeekday(date: OperationalDateInt, locale: string): string {
	const civilDate = dateAsUtc(date);
	const formattedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeZone: 'UTC' }).format(civilDate);
	const weekday = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', weekday: 'short' }).format(civilDate);
	return `${formattedDate} (${weekday})`;
}

function truncateDates(dates: string[], t: TFunction, max = 5): string {
	if (dates.length <= max) return dates.join(', ');
	return schedulingMessage(t, 'moreDates', { count: dates.length - max, dates: dates.slice(0, max).join(', ') });
}

/**
 * Builds detailed tooltip text for event rules.
 *
 * Restriction rules: "Oferta excluída [on dates] [time window]"
 * Replacement rules: "Funcionará como [weekdays] · [periods] · [dates]"
 * Manual event rules: filtered event dates based on weekdays and/or periods
 */
function buildRuleSummaryTooltip(
	rule: ScheduleRule,
	options: { events?: Event[], locale: string, periods?: YearPeriod[], t: TFunction },
): string {
	if (isEventRestriction(rule)) {
		const formattedDates = (rule.dates ?? []).map(date => formatDateWithWeekday(date, options.locale));
		const dates = truncateDates(formattedDates, options.t);
		const datesText = schedulingMessage(options.t, 'onDates', { dates });

		const timeWindow = (!rule.all_day && rule.start_time && rule.end_time)
			? schedulingMessage(options.t, 'timeWindow', { end: rule.end_time, start: rule.start_time })
			: '';

		return [schedulingMessage(options.t, 'excluded', { dates: datesText }), timeWindow].filter(Boolean).join(', ');
	}

	if (isEventReplacement(rule)) {
		const formattedDates = [...(rule.dates ?? [])].sort().map(date => formatDateWithWeekday(date, options.locale));
		const dates = truncateDates(formattedDates, options.t);
		const datesText = schedulingMessage(options.t, 'onDates', { dates });

		const periods = rule.year_period_ids
			?.map(id => options?.periods?.find(p => p._id === id)?.name || id)
			.join(', ') || '';

		if (rule.same_weekday) {
			const parts = [schedulingMessage(options.t, 'sameWeekday'), periods].filter(Boolean);
			return schedulingMessage(options.t, 'replacement', { dates: datesText, replacement: parts.join(' · ') });
		}

		const weekdays = rule.weekdays
			?.map(wd => getSchedulingWeekdayOptions(options.locale, options.t).find(opt => opt.value === wd)?.label)
			.filter(Boolean)
			.join(', ') ?? '';

		const parts = [weekdays, periods].filter(Boolean);
		return schedulingMessage(options.t, 'replacement', { dates: datesText, replacement: parts.join(' · ') });
	}

	if (rule.kind === 'manual' && rule.event_id) {
		const event = getEventForManualRule(rule, options?.events);

		const filteredDates = (event?.dates ?? []).filter((date) => {
			const matchesWeekdays = dateMatchesWeekdays(date, rule.weekdays);
			const matchesPeriods = dateMatchesPeriods(date, rule.year_period_ids, options?.periods);
			const matchesMonths = !rule.months?.length || rule.months.some(month => month === Number(String(date).slice(4, 6)));
			return matchesWeekdays && matchesPeriods && matchesMonths;
		});

		const dates = truncateDates(filteredDates.map(date => formatDateWithWeekday(date, options.locale)), options.t);
		if (!dates) return '';

		const datesText = schedulingMessage(options.t, 'onDates', { dates });
		return schedulingMessage(options.t, 'applicable', { dates: datesText });
	}

	return '';
}
