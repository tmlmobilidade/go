import { type ScheduleEventData } from '@mantine/schedule';
import { validateOperationalDate } from '@tmlmobilidade/types';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { filterCalendarScheduleEventsForDate } from '../src/components/calendar/utils/calendar-schedule-event-range';
import { buildCalendarScheduleEvents } from '../src/components/calendar/utils/calendar-schedule-events';

/* * */

function createEvent(start: string, end: string): ScheduleEventData {
	return {
		color: 'blue',
		end,
		id: `${start}:${end}`,
		start,
		title: 'Test event',
	};
}

/* * */

describe('filterCalendarScheduleEventsForDate', () => {
	it('handles the exclusive end generated for consecutive period dates', () => {
		const [event] = buildCalendarScheduleEvents({
			yearPeriods: [{
				_id: '2KIUJ',
				dates: ['20260214', '20260215', '20260216', '20260217', '20260218'].map(validateOperationalDate),
				name: 'Período de férias escolares',
			}],
		});

		assert.equal(event.start, '2026-02-14 00:00:00');
		assert.equal(event.end, '2026-02-19 00:00:00');
		assert.deepEqual(filterCalendarScheduleEventsForDate([event], '2026-02-18'), [event]);
		assert.deepEqual(filterCalendarScheduleEventsForDate([event], '2026-02-19'), []);
	});

	it('excludes a midnight end from a multi-day event', () => {
		const event = createEvent('2026-02-14 00:00:00', '2026-02-19 00:00:00');

		assert.deepEqual(filterCalendarScheduleEventsForDate([event], '2026-02-14'), [event]);
		assert.deepEqual(filterCalendarScheduleEventsForDate([event], '2026-02-18'), [event]);
		assert.deepEqual(filterCalendarScheduleEventsForDate([event], '2026-02-19'), []);
	});

	it('includes the final day when the end occurs later that day', () => {
		const event = createEvent('2026-02-14 00:00:00', '2026-02-18 23:59:59');

		assert.deepEqual(filterCalendarScheduleEventsForDate([event], '2026-02-18'), [event]);
		assert.deepEqual(filterCalendarScheduleEventsForDate([event], '2026-02-19'), []);
	});

	it('keeps timed events on every calendar day they intersect', () => {
		const event = createEvent('2026-02-18 23:00:00', '2026-02-19 01:00:00');

		assert.deepEqual(filterCalendarScheduleEventsForDate([event], '2026-02-18'), [event]);
		assert.deepEqual(filterCalendarScheduleEventsForDate([event], '2026-02-19'), [event]);
	});

	it('does not include dates before the event starts', () => {
		const event = createEvent('2026-02-14 00:00:00', '2026-02-15 00:00:00');

		assert.deepEqual(filterCalendarScheduleEventsForDate([event], '2026-02-13'), []);
		assert.deepEqual(filterCalendarScheduleEventsForDate([event], '2026-02-14'), [event]);
		assert.deepEqual(filterCalendarScheduleEventsForDate([event], '2026-02-15'), []);
	});
});
