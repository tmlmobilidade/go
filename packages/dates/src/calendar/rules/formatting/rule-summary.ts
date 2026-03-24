import { Dates } from '@/dates.js';
import { FORMATS } from '@/format.js';
import { Event, EventReplacementRule, EventRestrictionRule, ManualRule, ScheduleRule, WEEKDAY_OPTIONS, YearPeriod } from '@tmlmobilidade/types';

import { buildWeekdaysPart, buildYearPeriodsPart } from './common.js';

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
 *
 * @param rule - The scheduling rule to summarize
 * @param options - Configuration options (periods array for name resolution)
 * @returns RuleSummary with short, long, and tooltip text
 *
 * @example
 * ```ts
 * const rule = { kind: 'manual', weekdays: [1,2,3,4,5], year_period_ids: ['school'], ... };
 * const summary = buildRuleSummary(rule, { periods });
 * // summary = {
 * //   short: "Dias úteis · Período Escolar",
 * //   long: "Durante o Período Escolar, nos dias úteis",
 * //   tooltip: ""
 * // }
 * ```
 */
export function buildRuleSummary(
	rule: ScheduleRule,
	options: {
		events?: Event[]
		periods?: YearPeriod[]
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

/**
 * Builds the short summary format for a rule.
 *
 * Event rules: Returns event title
 * Manual rules: Returns "YearPeriod · Weekdays" format
 */
function buildRuleSummaryShort(
	rule: ScheduleRule,
	options: { events?: Event[], periods?: YearPeriod[] },
): string {
	if (isEventRestriction(rule)) {
		// Restriction: show event name
		return rule.event?.title ?? '';
	}

	if (isEventReplacement(rule)) {
		// Replacement: show event name
		return rule.event?.title ?? '';
	}

	if (rule.kind === 'manual' && rule.event_id) {
		const title = getEventForManualRule(rule, options?.events)?.title ?? '';
		if (!rule.weekdays?.length) return title;
		const weekdayPart = buildWeekdaysPart(rule, { mode: 'short' });
		return [title, weekdayPart].filter(Boolean).join(' · ');
	}

	// manual
	const parts: string[] = [];

	const periodPart = buildYearPeriodsPart(rule, options, { mode: 'short' });
	if (periodPart) parts.push(periodPart);

	const weekdayPart = buildWeekdaysPart(rule, { mode: 'short' });
	if (weekdayPart) parts.push(weekdayPart);

	return parts.join(' · ');
}

/**
 * Builds the long summary format for a rule.
 *
 * Event rules: Returns event title
 * Manual rules: Returns "During [period], on [weekdays]" format in Portuguese
 */
function buildRuleSummaryLong(
	rule: ScheduleRule,
	options: { events?: Event[], periods?: YearPeriod[] },
): string {
	if (isEventReplacement(rule) || isEventRestriction(rule)) {
		return rule.event?.title ?? '';
	}

	if (rule.kind === 'manual' && rule.event_id) {
		const title = getEventForManualRule(rule, options?.events)?.title ?? '';
		if (!rule.weekdays?.length) return title;
		const weekdayPart = buildWeekdaysPart(rule, { mode: 'long' });
		return [title, weekdayPart].filter(Boolean).join(', ');
	}

	// manual
	const parts: string[] = [];

	const periodPart = buildYearPeriodsPart(rule, options, { mode: 'long' });
	if (periodPart) parts.push(periodPart);

	const weekdayPart = buildWeekdaysPart(rule, { mode: 'long' });
	if (weekdayPart) parts.push(weekdayPart);

	return parts.join(', ');
}

/**
 * Formats a date with weekday indicator.
 * Example: "20/01/2025 (Sáb)"
 */
function formatDateWithWeekday(date: string): string {
	const dt = Dates.fromOperationalDate(date, 'Europe/Lisbon');
	const formattedDate = dt.toLocaleString(FORMATS.DATE_SHORT, 'pt-PT');
	const weekday = dt.js_date.getDay();
	const weekdayShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][weekday];
	return `${formattedDate} (${weekdayShort})`;
}

function truncateDates(dates: string[], max = 5): string {
	if (dates.length <= max) return dates.join(', ');
	const visible = dates.slice(0, max);
	const remaining = dates.length - max;
	return `${visible.join(', ')} e mais ${remaining}`;
}

/**
 * Builds detailed tooltip text for event rules.
 *
 * Restriction rules: "Oferta excluída [on dates] [time window]"
 * Replacement rules: "Funcionará como [weekdays] · [periods] · [dates]"
 * Manual rules: Returns empty string (no tooltip needed)
 */
function buildRuleSummaryTooltip(
	rule: ScheduleRule,
	options: { events?: Event[], periods?: YearPeriod[] },
): string {
	if (isEventRestriction(rule)) {
		const formattedDates = (rule.dates ?? []).map(formatDateWithWeekday);
		const dates = truncateDates(formattedDates);
		const datesText = (rule.dates?.length ?? 0) > 1 ? `nos dias ${dates}` : `no dia ${dates}`;

		const timeWindow = (rule?.start_time && rule?.end_time)
			? `entre as ${rule.start_time}h e ${rule.end_time}h`
			: '';

		return `Oferta excluída ${datesText}, ${timeWindow}`.trim();
	}

	if (isEventReplacement(rule)) {
		const formattedDates = [...(rule.dates ?? [])].sort().map(formatDateWithWeekday);
		const dates = truncateDates(formattedDates);
		const datesText = (rule.dates?.length ?? 0) > 1 ? `nos dias ${dates}` : `no dia ${dates}`;

		const periods = rule.year_period_ids
			?.map(id => options?.periods?.find(p => p._id === id)?.name || id)
			.join(', ') || '';

		if (rule.same_weekday) {
			const parts = ['mesmo dia da semana', periods].filter(Boolean);
			return `Funcionará como ${parts.join(' · ')}, ${datesText}`;
		}

		const weekdays = rule.weekdays
			?.map(wd => WEEKDAY_OPTIONS.find(opt => opt.value === wd)?.label)
			.filter(Boolean)
			.join(', ') ?? '';

		const parts = [weekdays, periods].filter(Boolean);
		return `Funcionará como ${parts.join(' · ')}, ${datesText}`;
	}

	if (rule.kind === 'manual' && rule.event_id) {
		const event = getEventForManualRule(rule, options?.events);
		const filteredDates = (event?.dates ?? []).filter((date) => {
			if (!rule.weekdays?.length) return true;
			const jsDay = Dates.fromOperationalDate(date, 'Europe/Lisbon').js_date.getDay();
			const isoWeekday = (jsDay === 0 ? 7 : jsDay) as (typeof rule.weekdays)[number];
			return rule.weekdays.includes(isoWeekday);
		});
		const dates = truncateDates(filteredDates.map(formatDateWithWeekday));
		if (!dates) return '';
		const datesText = filteredDates.length > 1 ? `nos dias ${dates}` : `no dia ${dates}`;
		return `Aplicável ${datesText}`;
	}

	return '';
}
