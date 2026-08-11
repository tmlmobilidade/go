import { type ScheduleEventData } from '@mantine/schedule';
import { getZonedCalendarDayInterval, type TimezoneIdentified } from '@tmlmobilidade/dates';
import { type CalendarDate, type CalendarEventType, type OperationalDate, toCalendarDate } from '@tmlmobilidade/types';

import { EVENT_TYPE_DEFS } from '../../../icons/event-types';

/* * */

export type CalendarScheduleEventType = CalendarEventType;

export interface CalendarSchedulePayload {
	agencyIds?: string[]
	agencyNames?: string[]
	description?: string
	sourceId: string
	type: CalendarScheduleEventType
}

export interface CalendarScheduleSources {
	agencies?: {
		_id: string
		code?: string
		name: string
		short_name?: string
	}[]
	annotations?: DatedScheduleSource[]
	events?: DatedScheduleSource[]
	holidays?: DatedScheduleSource[]
	yearPeriods?: {
		_id: string
		agency_ids?: string[]
		color?: string
		dates?: OperationalDate[]
		name: string
	}[]
}

export interface CalendarScheduleRuleImpactPayload extends CalendarSchedulePayload {
	sourceId: CalendarDate
	type: 'rule-impact'
}

interface DatedScheduleSource {
	_id: string
	agency_ids?: string[]
	dates: OperationalDate[]
	description?: string
	title: string
}

/* * */

function getUniqueCalendarDates(dates: OperationalDate[]): CalendarDate[] {
	return Array.from(new Set(dates.map(toCalendarDate))).sort();
}

function groupConsecutiveDates(dates: OperationalDate[], timezone: TimezoneIdentified): CalendarDate[][] {
	const sortedDates = getUniqueCalendarDates(dates);

	return sortedDates.reduce<CalendarDate[][]>((groups, date) => {
		const currentGroup = groups.at(-1);
		const previousDate = currentGroup?.at(-1);

		if (!currentGroup || !previousDate) {
			groups.push([date]);
			return groups;
		}

		const nextCalendarDate = getZonedCalendarDayInterval(previousDate, timezone).endExclusive.calendar_date;
		if (date === nextCalendarDate) {
			currentGroup.push(date);
		} else {
			groups.push([date]);
		}

		return groups;
	}, []);
}

function buildSourceEvents(
	source: DatedScheduleSource,
	type: Exclude<CalendarScheduleEventType, 'period' | 'rule-impact'>,
	timezone: TimezoneIdentified,
	agencyNames: Map<string, string>,
): ScheduleEventData<CalendarSchedulePayload>[] {
	return getUniqueCalendarDates(source.dates).map((date) => {
		const endExclusive = getZonedCalendarDayInterval(date, timezone).endExclusive.calendar_date;

		return {
			color: EVENT_TYPE_DEFS[type].color,
			end: `${endExclusive} 00:00:00`,
			id: `${type}:${source._id}:${date}`,
			payload: {
				agencyIds: source.agency_ids,
				agencyNames: source.agency_ids?.flatMap(id => agencyNames.get(id) ?? []),
				description: source.description,
				sourceId: source._id,
				type,
			},
			start: `${date} 00:00:00`,
			title: source.title,
			variant: 'light',
		};
	});
}

/* * */

export function buildCalendarScheduleEvents(
	sources: CalendarScheduleSources,
	timezone: TimezoneIdentified,
): ScheduleEventData<CalendarSchedulePayload>[] {
	const agencyNames = new Map((sources.agencies ?? []).map(agency => [agency._id, agency.short_name || agency.name]));

	const periodEvents = (sources.yearPeriods ?? []).flatMap((period) => {
		return groupConsecutiveDates(period.dates ?? [], timezone).map((range): ScheduleEventData<CalendarSchedulePayload> => {
			const startDate = range[0];
			const endDate = range.at(-1) ?? startDate;
			const endExclusive = getZonedCalendarDayInterval(endDate, timezone).endExclusive.calendar_date;

			return {
				color: period.color || EVENT_TYPE_DEFS.period.color,
				end: `${endExclusive} 00:00:00`,
				id: `period:${period._id}:${startDate}`,
				payload: {
					agencyIds: period.agency_ids,
					agencyNames: period.agency_ids?.flatMap(id => agencyNames.get(id) ?? []),
					sourceId: period._id,
					type: 'period',
				},
				start: `${startDate} 00:00:00`,
				title: period.name,
			};
		});
	});

	return [
		...periodEvents,
		...(sources.holidays ?? []).flatMap(source => buildSourceEvents(source, 'holiday', timezone, agencyNames)),
		...(sources.annotations ?? []).flatMap(source => buildSourceEvents(source, 'annotation', timezone, agencyNames)),
		...(sources.events ?? []).flatMap(source => buildSourceEvents(source, 'event', timezone, agencyNames)),
	];
}

/* * */

export function buildCalendarScheduleRuleImpactEvents(
	affectedDates: CalendarDate[],
	timezone: TimezoneIdentified,
): ScheduleEventData<CalendarScheduleRuleImpactPayload>[] {
	return affectedDates.map((date) => {
		const interval = getZonedCalendarDayInterval(date, timezone);

		return {
			color: 'var(--color-primary)',
			end: `${interval.endExclusive.calendar_date} 00:00:00`,
			id: `rule-impact:${date}`,
			payload: {
				sourceId: date,
				type: 'rule-impact',
			},
			start: `${date} 00:00:00`,
			title: 'Dia afetado pela regra',
			variant: 'filled',
		};
	});
}

export function isCalendarSchedulePayload(payload: unknown): payload is CalendarSchedulePayload {
	if (!payload || typeof payload !== 'object') return false;

	const candidate = payload as Partial<CalendarSchedulePayload>;
	return typeof candidate.sourceId === 'string' && ['annotation', 'event', 'holiday', 'period', 'rule-impact'].includes(candidate.type ?? '');
}
