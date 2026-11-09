import { type Event, type ScheduleRule, type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { getMonthOptions, getWeekdayOptions } from '@tmlmobilidade/go-utils-dates';
import { type TFunction } from 'i18next';

/* * */

// ALL/OFF/ALLDAY are structural markers used by export/import diagnostics, not UI copy.
export function getGtfsNamingTokens(t: TFunction) {
	return {
		all: 'ALL',
		allDay: 'ALLDAY',
		businessDays: t('offerScheduling:gtfs.businessDays', ''),
		off: 'OFF',
	};
}

/** Convert generated calendar labels to compact tokens; supplied Event/Period codes remain intact. */
function calendarToken(label: string, locale: string): string {
	return label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, '').toLocaleUpperCase(locale);
}

/** No environment-specific Period IDs or inferred abbreviations belong in export naming. */
function periodToken(ids: string[], periods: YearPeriod[], all: string): string {
	if (!ids.length) return all;
	const selected = [...new Set(ids)];
	const labels = selected.map((id) => {
		const period = periods.find(period => period._id === id);
		if (!period) throw new Error(`Cannot name GTFS service: Period ${id} is outside the agency scope or missing`);
		if (!period.short_name?.trim()) throw new Error(`Cannot name GTFS service: Period ${id} requires short_name`);
		return period.short_name;
	});
	if (periods.length > 0 && selected.length === periods.length && periods.every(period => selected.includes(period._id))) return all;
	// Stored names are agency-owned text; do not translate or rewrite them.
	return [...new Set(labels)].sort().join('-');
}

/** Agency-localized service naming, independent of UI summary wording and browser locale. */
export function buildRuleSummaryGtfs(rule: ScheduleRule, options: { events?: Event[], locale: string, periods?: YearPeriod[], t: TFunction }): string {
	const { locale } = options;
	const tokens = getGtfsNamingTokens(options.t);
	if (rule.kind === 'event_restriction' || rule.kind === 'event_replacement') {
		const eventCode = options.events?.find(event => event._id === rule.event.id)?.code;
		const base = eventCode ?? rule.name ?? rule._id ?? rule.event.id;
		if (rule.kind === 'event_restriction') {
			if (rule.all_day) return `${base}_${tokens.allDay}`;
			if (rule.start_time && rule.end_time) return `${base}_${rule.start_time.replace(':', '')}${rule.end_time.replace(':', '')}`;
		}
		return base;
	}

	const periods = periodToken(rule.year_period_ids ?? [], options.periods ?? [], tokens.all);
	const days = [...new Set(rule.weekdays ?? [])].sort((a, b) => a - b);
	const weekdayOptions = getWeekdayOptions(locale);
	const dayToken = (day: number) => calendarToken(weekdayOptions.find(option => option.value === day)?.label ?? String(day), locale);
	const hasBusinessDays = [1, 2, 3, 4, 5].every(day => days.some(selected => selected === day));
	const weekdays = !days.length || days.length === 7
		? tokens.all
		: hasBusinessDays ? [tokens.businessDays, ...days.filter(day => day > 5).map(dayToken)].join('-') : days.map(dayToken).join('-');
	const months = getMonthOptions(locale).filter(option => rule.months?.includes(option.value)).map(option => calendarToken(option.label, locale)).join('-');
	const narrowing = [periods === tokens.all ? '' : periods, months, weekdays === tokens.all ? '' : weekdays].filter(Boolean);
	if (rule.event_id) {
		const code = options.events?.find(event => event._id === rule.event_id)?.code ?? rule.name ?? rule._id;
		return [code, ...narrowing].join('_');
	}
	return [periods, months, weekdays === tokens.all ? '' : weekdays].filter(Boolean).join('_');
}
