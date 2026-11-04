import { Event, EventRule, ManualRule, ScheduleRule, YearPeriod } from '@tmlmobilidade/go-types-offer';
import { OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { getCompactWeekdayOptions } from '@tmlmobilidade/go-utils-dates';
import { type TFunction } from 'i18next';

import { buildMonthsPart, buildWeekdaysPart, buildYearPeriodsPart } from './common.js';
import { schedulingMessage } from './messages.js';

type SummaryRule = EventRule | ScheduleRule;

/**
 * Human-readable summary of a rule in multiple formats.
 * Used for displaying rule information in UI components.
 */
export interface RuleSummary {
	/** Compact scheduling conditions, without the parent event's title or dates. */
	conditions: string
	/** Compact title used consistently in rule lists, editors and previews. */
	label: string
	/** Detailed tooltip with event dates/times if applicable */
	tooltip: string
}

/**
 * Builds human-readable summaries of a scheduling rule.
 *
 * Generates a compact title and optional event details with dates and times.
 */
export function buildRuleSummary(
	rule: SummaryRule,
	options: {
		events?: Event[]
		locale: string
		periods?: YearPeriod[]
		t: TFunction
	},
): RuleSummary {
	return {
		conditions: buildRuleConditions(rule, options),
		label: buildRuleLabel(rule, options),
		tooltip: buildRuleSummaryTooltip(rule, options),
	};
}

/**
 * Type guard for event restriction rules.
 */
const isEventRestriction = (r: SummaryRule): r is Extract<SummaryRule, { kind: 'event_restriction' }> => r.kind === 'event_restriction';

/**
 * Type guard for event replacement rules.
 */
const isEventReplacement = (r: SummaryRule): r is Extract<SummaryRule, { kind: 'event_replacement' }> => r.kind === 'event_replacement';

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
function buildRuleLabel(
	rule: SummaryRule,
	options: { events?: Event[], locale: string, periods?: YearPeriod[], t: TFunction },
): string {
	if (isEventRestriction(rule)) {
		return 'event' in rule ? rule.event.title : buildRuleConditions(rule, options);
	}

	if (isEventReplacement(rule)) {
		return 'event' in rule ? rule.event.title : buildRuleConditions(rule, options);
	}

	if (rule.kind === 'manual' && rule.event_id) {
		const title = getEventForManualRule(rule, options?.events)?.title ?? '';
		const periodPart = rule.year_period_ids?.length ? buildYearPeriodsPart(rule, options, { omitIfAll: true }) : '';
		const monthsPart = buildMonthsPart(rule, { locale: options.locale, omitIfAll: true, t: options.t });
		const weekdayPart = buildWeekdaysPart(rule, { locale: options.locale, omitIfAll: true, t: options.t });
		return [title, periodPart, monthsPart, weekdayPart].filter(Boolean).join(' · ');
	}

	return buildRuleConditions(rule, options);
}

/** Shared condition formatting for manual rules and inferred event rules. */
function buildRuleConditions(
	rule: SummaryRule,
	options: { locale: string, periods?: YearPeriod[], t: TFunction },
): string {
	if (isEventRestriction(rule)) {
		if (rule.all_day) return schedulingMessage(options.t, 'allDay');
		if (rule.timepoints?.length) return [...new Set(rule.timepoints)].sort().join(', ');
		return rule.start_time && rule.end_time
			? `${rule.start_time}–${rule.end_time}`
			: '';
	}

	const parts: string[] = [];

	const periodPart = buildYearPeriodsPart(rule, options);
	if (periodPart) parts.push(periodPart);

	const monthsPart = rule.kind === 'manual' ? buildMonthsPart(rule, { locale: options.locale, omitIfAll: true, t: options.t }) : '';
	if (monthsPart) parts.push(monthsPart);

	const weekdayPart = isEventReplacement(rule) && rule.same_weekday
		? schedulingMessage(options.t, 'sameWeekday')
		: buildWeekdaysPart(rule, { locale: options.locale, t: options.t });
	if (weekdayPart) parts.push(weekdayPart);

	return parts.join(' · ');
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
	const isoWeekday = civilDate.getUTCDay() || 7;
	const weekday = getCompactWeekdayOptions(locale).find(option => option.value === isoWeekday)?.label ?? '';
	return `${formattedDate} (${weekday})`;
}

/** Date-only detail for event day-count tooltips, without rule-effect copy. */
export function formatRuleDates(dates: OperationalDateInt[], locale: string): string {
	return [...new Set(dates)].sort((a, b) => a - b).map(date => formatDateWithWeekday(date, locale)).join(', ');
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
	rule: SummaryRule,
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

		return schedulingMessage(options.t, 'replacement', { dates: datesText, replacement: buildRuleConditions(rule, options) });
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
