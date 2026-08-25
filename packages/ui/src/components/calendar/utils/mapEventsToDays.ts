/* * */

import { type CalendarDay, type CalendarKey, parseCalendarKey } from '@tmlmobilidade/dates';
import { type CalendarEvent } from '@tmlmobilidade/types';

/* * */

export interface EventPosition {
	event: CalendarEvent
	isEnd: boolean
	isMiddle: boolean
	isStart: boolean
}

/* * */
/**
 * Maps events to the visible calendar days (weeks.flat()) using civil calendar keys (YYYY-MM-DD).
 * Returns both:
 *  - eventsByDate: Map<CalendarKey, CalendarEvent[]>
 *  - positionsByDate: Map<CalendarKey, EventPosition[]>  (useful for month strips)
 */
export function mapEventsToVisibleDays(
	events: CalendarEvent[],
	visibleDays: CalendarDay[],
) {
	// If visibleDays is truly "visible", this set is optional,
	// but it protects against callers passing non-visible days accidentally.
	const visibleKeys = new Set<CalendarKey>(visibleDays.map(d => d.calendarKey));

	const eventsByDate = new Map<CalendarKey, CalendarEvent[]>();
	const positionsByDate = new Map<CalendarKey, EventPosition[]>();

	for (const event of events) {
		// ✅ canonical parsing (date-only -> noon Lisbon; ISO -> tz-normalized)
		const startKey = parseCalendarKey(event.startDate);
		const endKey = event.endDate ? parseCalendarKey(event.endDate) : startKey;

		for (const day of visibleDays) {
			// ✅ canonical day key for this cell
			const dateKey = day.calendarKey;

			if (!visibleKeys.has(dateKey)) continue;
			if (dateKey < startKey || dateKey > endKey) continue;

			// 1) Plain list (year view)
			eventsByDate.set(dateKey, [...(eventsByDate.get(dateKey) ?? []), event]);

			// 2) Positioned list (month view)
			positionsByDate.set(dateKey, [
				...(positionsByDate.get(dateKey) ?? []),
				{
					event,
					isEnd: dateKey === endKey,
					isMiddle: dateKey !== startKey && dateKey !== endKey,
					isStart: dateKey === startKey,
				},
			]);
		}
	}

	return { eventsByDate, positionsByDate };
}
