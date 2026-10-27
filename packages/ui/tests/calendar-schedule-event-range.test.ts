import { type ScheduleEventData } from '@mantine/schedule';
import { validateOperationalDate } from '@tmlmobilidade/go-types-shared';
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

it('groups consecutive period days across a leap day and keeps the end exclusive', () => {
	const events = buildCalendarScheduleEvents({ yearPeriods: [{
		_id: 'leap-period',
		dates: ['20280228', '20280229', '20280301', '20280301'].map(validateOperationalDate),
		name: 'Leap period',
	}] });
	assert.equal(events.length, 1);
	assert.equal(events[0].start, '2028-02-28 00:00:00');
	assert.equal(events[0].end, '2028-03-02 00:00:00');
	assert.deepEqual(filterCalendarScheduleEventsForDate(events, '2028-03-01'), events);
	assert.deepEqual(filterCalendarScheduleEventsForDate(events, '2028-03-02'), []);
});

it('splits consecutive period dates at New Year so annual views include January', () => {
	const events = buildCalendarScheduleEvents({ yearPeriods: [{
		_id: 'school-holidays',
		color: '#42c96b',
		dates: ['20251230', '20251231', '20260101', '20260102', '20260103', '20260104'].map(validateOperationalDate),
		name: 'School holidays',
	}] });

	assert.equal(events.length, 2);
	assert.equal(events[0].start, '2025-12-30 00:00:00');
	assert.equal(events[0].end, '2026-01-01 00:00:00');
	assert.equal(events[1].start, '2026-01-01 00:00:00');
	assert.equal(events[1].end, '2026-01-05 00:00:00');
	assert.equal(new Set(events.map(event => event.id)).size, 2);
	const annualEvents = events.filter(event => String(event.start).startsWith('2026'));
	for (const day of ['01', '02', '03', '04']) {
		assert.deepEqual(filterCalendarScheduleEventsForDate(annualEvents, `2026-01-${day}`), [events[1]]);
	}
	assert.deepEqual(filterCalendarScheduleEventsForDate(annualEvents, '2026-01-05'), []);
	assert.deepEqual(events[1].payload, events[0].payload);
	assert.equal(events[1].color, '#42c96b');
});
