import { getZonedCalendarDayInterval, type TimezoneIdentified } from '@tmlmobilidade/dates';
import { type CalendarDate, type OperationalDate, toCalendarDate } from '@tmlmobilidade/types';
import { EVENT_TYPE_DEFS, type ScheduleEventData } from '@tmlmobilidade/ui';

/* * */

export type DatesScheduleEventType = 'annotation' | 'event' | 'holiday' | 'period';

export interface DatesSchedulePayload {
	agencyIds?: string[]
	agencyNames?: string[]
	description?: string
	sourceId: string
	type: DatesScheduleEventType
}

export interface DatesScheduleSources {
	agencies: {
		_id: string
		name: string
		short_name?: string
	}[]
	annotations: DatedScheduleSource[]
	events: DatedScheduleSource[]
	holidays: DatedScheduleSource[]
	yearPeriods: {
		_id: string
		agency_ids?: string[]
		color?: string
		dates?: OperationalDate[]
		name: string
	}[]
}

interface DatedScheduleSource {
	_id: string
	dates: OperationalDate[]
	description?: string
	title: string
}

/* * */

function groupConsecutiveDates(dates: OperationalDate[], timezone: TimezoneIdentified): CalendarDate[][] {
	const sortedDates = Array.from(new Set(dates.map(toCalendarDate))).sort();

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
	type: Exclude<DatesScheduleEventType, 'period'>,
	timezone: TimezoneIdentified,
): ScheduleEventData<DatesSchedulePayload>[] {
	return groupConsecutiveDates(source.dates, timezone).map((range) => {
		const startDate = range[0];
		const endDate = range.at(-1) ?? startDate;
		const endExclusive = getZonedCalendarDayInterval(endDate, timezone).endExclusive.calendar_date;

		return {
			color: EVENT_TYPE_DEFS[type].color,
			end: `${endExclusive} 00:00:00`,
			id: `${type}:${source._id}:${startDate}`,
			payload: {
				description: source.description,
				sourceId: source._id,
				type,
			},
			start: `${startDate} 00:00:00`,
			title: source.title,
			variant: 'filled',
		};
	});
}

/* * */

export function buildDatesScheduleEvents(
	sources: DatesScheduleSources,
	timezone: TimezoneIdentified,
): ScheduleEventData<DatesSchedulePayload>[] {
	const agencyNames = new Map(sources.agencies.map(agency => [agency._id, agency.short_name || agency.name]));

	const periodEvents = sources.yearPeriods.flatMap((period) => {
		return groupConsecutiveDates(period.dates ?? [], timezone).map((range): ScheduleEventData<DatesSchedulePayload> => {
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
		...sources.annotations.flatMap(source => buildSourceEvents(source, 'annotation', timezone)),
		...sources.holidays.flatMap(source => buildSourceEvents(source, 'holiday', timezone)),
		...sources.events.flatMap(source => buildSourceEvents(source, 'event', timezone)),
	];
}

export function isDatesSchedulePayload(payload: unknown): payload is DatesSchedulePayload {
	if (!payload || typeof payload !== 'object') return false;

	const candidate = payload as Partial<DatesSchedulePayload>;
	return typeof candidate.sourceId === 'string' && ['annotation', 'event', 'holiday', 'period'].includes(candidate.type ?? '');
}
