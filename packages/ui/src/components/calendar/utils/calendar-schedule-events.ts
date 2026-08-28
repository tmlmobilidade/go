import { type ScheduleEventData } from '@mantine/schedule';
import { Dates } from '@tmlmobilidade/dates';
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

function getNextCalendarDate(date: CalendarDate): CalendarDate {
	return Dates.fromFormat(date, 'yyyy-MM-dd', 'utc').plus({ days: 1 }).calendar_date;
}

function groupConsecutiveDates(dates: OperationalDate[]): CalendarDate[][] {
	const sortedDates = getUniqueCalendarDates(dates);

	return sortedDates.reduce<CalendarDate[][]>((groups, date) => {
		const currentGroup = groups.at(-1);
		const previousDate = currentGroup?.at(-1);

		if (!currentGroup || !previousDate) {
			groups.push([date]);
			return groups;
		}

		const nextCalendarDate = getNextCalendarDate(previousDate);
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
	agencyNames: Map<string, string>,
): ScheduleEventData<CalendarSchedulePayload>[] {
	return getUniqueCalendarDates(source.dates).map((date) => {
		const endExclusive = getNextCalendarDate(date);

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
): ScheduleEventData<CalendarSchedulePayload>[] {
	const agencyNames = new Map((sources.agencies ?? []).map(agency => [agency._id, agency.short_name || agency.name]));

	const periodEvents = (sources.yearPeriods ?? []).flatMap((period) => {
		return groupConsecutiveDates(period.dates ?? []).map((range): ScheduleEventData<CalendarSchedulePayload> => {
			const startDate = range[0];
			const endDate = range.at(-1) ?? startDate;
			const endExclusive = getNextCalendarDate(endDate);

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
		...(sources.holidays ?? []).flatMap(source => buildSourceEvents(source, 'holiday', agencyNames)),
		...(sources.annotations ?? []).flatMap(source => buildSourceEvents(source, 'annotation', agencyNames)),
		...(sources.events ?? []).flatMap(source => buildSourceEvents(source, 'event', agencyNames)),
	];
}

/* * */

export function buildCalendarScheduleRuleImpactEvents(
	affectedDates: CalendarDate[],
): ScheduleEventData<CalendarScheduleRuleImpactPayload>[] {
	return affectedDates.map((date) => {
		return {
			color: 'var(--color-primary)',
			end: `${getNextCalendarDate(date)} 00:00:00`,
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
