import { CreateAnnotationSchema, CreateHolidaySchema } from '@tmlmobilidade/go-types-dates';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CreateEventSchema } from '../src/dates/event.js';
import { CreateYearPeriodSchema, UpdateYearPeriodDatesSchema } from '../src/dates/year-period.js';

/* * */

test('Events normalize parent and nested rule dates to integers', () => {
	const event = CreateEventSchema.parse({
		agency_ids: ['A'],
		code: 'EVENT',
		dates: ['20261028', 20261029],
		rules: [{ all_day: true, dates: ['20261028', 20261029], kind: 'event_restriction', lines_mode: 'all' }],
		title: 'Event',
	});
	assert.deepEqual(event.dates, [20261028, 20261029]);
	assert.deepEqual(event.rules[0].dates, event.dates);
});

test('Periods normalize date fields before assignment overlap validation', () => {
	const period = CreateYearPeriodSchema.parse({ agency_ids: ['A'], dates: ['20261028', 20261029], name: 'Period' });
	assert.deepEqual(period.dates, [20261028, 20261029]);
	assert.equal(UpdateYearPeriodDatesSchema.safeParse({ add_dates: ['20261028'], remove_dates: [20261028] }).success, false);
});

for (const [name, schema] of Object.entries({ annotation: CreateAnnotationSchema, holiday: CreateHolidaySchema })) {
	test(`${name}: mixed legacy and integer dates normalize to integer output`, () => {
		const parsed = schema.parse({ agency_ids: ['A'], dates: ['20261028', 20261029], title: 'Title' });
		assert.deepEqual(parsed.dates, [20261028, 20261029]);
	});

	test(`${name}: invalid operational dates are rejected`, () => {
		for (const date of ['20260230', 'invalid', false]) {
			assert.equal(schema.safeParse({ agency_ids: ['A'], dates: [date], title: 'Title' }).success, false);
		}
	});
}
