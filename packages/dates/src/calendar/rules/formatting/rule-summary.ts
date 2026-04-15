import { Dates } from '@/dates.js';
import { FORMATS } from '@/format.js';
import {
	Event,
	EventReplacementRule,
	EventRestrictionRule,
	ManualRule,
	MONTH_OPTIONS,
	OperationalDate,
	ScheduleRule,
	WEEKDAY_OPTIONS,
	YearPeriod,
} from '@tmlmobilidade/types';

import { buildMonthsPart, buildWeekdaysPart, buildYearPeriodsPart } from './common.js';

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

function dateMatchesWeekdays(date: string, weekdays?: number[]): boolean {
	if (!weekdays?.length) return true;

	const jsDay = Dates.fromOperationalDate(date, 'Europe/Lisbon').js_date.getDay();
	const isoWeekday = (jsDay === 0 ? 7 : jsDay) as number;

	return weekdays.includes(isoWeekday);
}

function dateMatchesPeriods(
	date: OperationalDate,
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
	options: { events?: Event[], periods?: YearPeriod[] },
): string {
	if (isEventRestriction(rule)) {
		return rule.event?.title ?? '';
	}

	if (isEventReplacement(rule)) {
		return rule.event?.title ?? '';
	}

	if (rule.kind === 'manual' && rule.event_id) {
		const title = getEventForManualRule(rule, options?.events)?.title ?? '';

		const parts: string[] = [];
		if (title) parts.push(title);

		const periodPart = buildYearPeriodsPart(rule, options, { mode: 'short', omitIfAll: true });
		if (periodPart) parts.push(periodPart);

		const monthsPart = buildMonthsPart(rule, { mode: 'short', omitIfAll: true });
		if (monthsPart) parts.push(monthsPart);

		const weekdayPart = buildWeekdaysPart(rule, { mode: 'short', omitIfAll: true });
		if (weekdayPart) parts.push(weekdayPart);

		return parts.join(' · ');
	}

	// manual
	const parts: string[] = [];

	const periodPart = buildYearPeriodsPart(rule, options, { mode: 'short' });
	if (periodPart) parts.push(periodPart);

	const monthsPart = buildMonthsPart(rule, { mode: 'short', omitIfAll: true });
	if (monthsPart) parts.push(monthsPart);

	const weekdayPart = buildWeekdaysPart(rule, { mode: 'short' });
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
	options: { events?: Event[], periods?: YearPeriod[] },
): string {
	if (isEventReplacement(rule) || isEventRestriction(rule)) {
		return rule.event?.title ?? '';
	}

	if (rule.kind === 'manual' && rule.event_id) {
		const title = getEventForManualRule(rule, options?.events)?.title ?? '';

		const parts: string[] = [];
		if (title) parts.push(title);

		const periodPart = buildYearPeriodsPart(rule, options, { mode: 'long', omitIfAll: true });
		if (periodPart) parts.push(periodPart);

		const monthsPart = buildMonthsPart(rule, { mode: 'long', omitIfAll: true });
		if (monthsPart) parts.push(monthsPart);

		const weekdayPart = buildWeekdaysPart(rule, { mode: 'long', omitIfAll: true });
		if (weekdayPart) parts.push(weekdayPart);

		return parts.join(', ');
	}

	// manual
	const parts: string[] = [];

	const periodPart = buildYearPeriodsPart(rule, options, { mode: 'long' });
	if (periodPart) parts.push(periodPart);

	const monthsPart = buildMonthsPart(rule, { mode: 'long', omitIfAll: true });
	if (monthsPart) parts.push(monthsPart);

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
 * Manual event rules: filtered event dates based on weekdays and/or periods
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
			const matchesWeekdays = dateMatchesWeekdays(date, rule.weekdays);
			const matchesPeriods = dateMatchesPeriods(date, rule.year_period_ids, options?.periods);
			return matchesWeekdays && matchesPeriods;
		});

		const dates = truncateDates(filteredDates.map(formatDateWithWeekday));
		if (!dates) return '';

		const datesText = filteredDates.length > 1 ? `nos dias ${dates}` : `no dia ${dates}`;
		return `Aplicável ${datesText}`;
	}

	return '';
}

/**
 * TEMP:
 * Maps year period ids/names into GTFS abbreviations.
 * Replace with a persisted abbreviation/code field when available.
 */
function mapPeriodsToGtfsAbbreviation(periodIds?: string[]): string {
	if (!periodIds?.length) return 'ALL';

	const map: Record<string, string> = {
		'2KIUJ': 'FER',
		'99H2R': 'ESC',
		'UW2U0': 'VER',
	};

	const abbreviations = periodIds.map((id) => {
		const abbr = map[id];
		if (!abbr) throw new Error(`Unknown period id: ${id}`);
		return abbr;
	});

	const unique = [...new Set(abbreviations)];
	const allSet = new Set(['ESC', 'FER', 'VER']);

	// If all three are present, return 'ALL'
	if (unique.length === 3 && unique.every(x => allSet.has(x))) {
		return 'ALL';
	}

	return unique.join('-');
}

function mapWeekdaysToGtfsAbbreviation(weekdays?: number[]): string {
	if (!weekdays?.length) return 'ALL';

	const sorted = [...new Set(weekdays)].sort((a, b) => a - b);

	if (sorted.length === 7) return 'ALL';

	const map: Record<number, string> = {
		1: 'SEG',
		2: 'TER',
		3: 'QUA',
		4: 'QUI',
		5: 'SEX',
		6: 'SAB',
		7: 'DOM',
	};

	// Collapse weekdays 1-5 into DU when all present
	const hasDU = [1, 2, 3, 4, 5].every(d => sorted.includes(d));
	if (hasDU) {
		const weekend = sorted.filter(d => d > 5).map(d => map[d]);
		return ['DU', ...weekend].join('-');
	}

	return sorted.map(day => map[day] || String(day)).join('-');
}

function mapMonthsToGtfsAbbreviation(months?: number[]): null | string {
	if (!months?.length) return null;
	const sorted = [...months].sort((a, b) => a - b);
	return sorted
		.map(m => MONTH_OPTIONS.find(o => o.value === m)?.label.toUpperCase() ?? String(m))
		.join('-');
}

/**
 * GTFS-oriented rule token:
 * - FER_DU
 * - VER_SAB
 * - ESC_DOM
 * - ALL
 * - ALL_DU
 * - VER-FER_SAB-DOM
 * - Rock in Rio_VER_DU
 */
export function buildRuleSummaryGtfs(
	rule: ScheduleRule,
	options: { events?: Event[], periods?: YearPeriod[] },
): string {
	if (isEventRestriction(rule)) {
		const base = rule.event?.title ?? rule.name ?? rule._id;
		if (rule.all_day) return `${base}_ALLDAY`;
		if (rule.start_time && rule.end_time)
			return `${base}_${rule.start_time.replace(':', '')}${rule.end_time.replace(':', '')}`;
		return base;
	}
	if (isEventReplacement(rule)) {
		return rule.event?.title ?? rule.name ?? rule._id;
	}

	const periodIds = rule.year_period_ids ?? [];
	const weekdays = rule.weekdays ?? [];

	const periodPart = mapPeriodsToGtfsAbbreviation(periodIds);
	const weekdayPart = mapWeekdaysToGtfsAbbreviation(weekdays);
	const monthsPart = mapMonthsToGtfsAbbreviation(rule.months);

	if (rule.kind === 'manual' && rule.event_id) {
		const title = getEventForManualRule(rule, options?.events)?.title ?? rule.name ?? rule._id;

		const tokenParts: string[] = [];
		if (periodPart !== 'ALL') tokenParts.push(periodPart);
		if (monthsPart) tokenParts.push(monthsPart);
		if (weekdayPart !== 'ALL') tokenParts.push(weekdayPart);

		if (!tokenParts.length) return title;
		return `${title}_${tokenParts.join('_')}`;
	}

	const tokenParts: string[] = [periodPart];
	if (monthsPart) tokenParts.push(monthsPart);
	if (weekdayPart !== 'ALL') tokenParts.push(weekdayPart);

	if (tokenParts.length === 1 && tokenParts[0] === 'ALL') return 'ALL';
	return tokenParts.join('_');
}
