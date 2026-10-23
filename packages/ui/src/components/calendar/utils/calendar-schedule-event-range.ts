import { type ScheduleEventData } from '@mantine/schedule';
import dayjs from 'dayjs';

/* * */

export function filterCalendarScheduleEventsForDate(
	events: ScheduleEventData[],
	date: string,
): ScheduleEventData[] {
	const calendarDay = dayjs(date).startOf('day');

	return events.filter((event) => {
		const start = dayjs(event.start);
		const rawEnd = dayjs(event.end);
		const endIsExclusiveMidnight = rawEnd.isAfter(start) && rawEnd.isSame(rawEnd.startOf('day'));
		const finalCalendarDay = endIsExclusiveMidnight
			? rawEnd.subtract(1, 'day').startOf('day')
			: rawEnd.startOf('day');

		return !calendarDay.isBefore(start.startOf('day')) && !calendarDay.isAfter(finalCalendarDay);
	});
}
