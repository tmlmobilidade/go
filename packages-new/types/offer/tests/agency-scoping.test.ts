import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { CreateAnnotationSchema, UpdateAnnotationSchema } from '../src/dates/annotation.js';
import { CreateEventSchema, UpdateEventSchema } from '../src/dates/event.js';
import { CreateHolidaySchema, UpdateHolidaySchema } from '../src/dates/holiday.js';
import { CreateYearPeriodSchema, UpdateYearPeriodSchema } from '../src/dates/year-period.js';
import { CreateFareSchema, UpdateFareSchema } from '../src/network/fare.js';
import { CreateTypologySchema, UpdateTypologySchema } from '../src/network/typology.js';
import { CreateZoneSchema, UpdateZoneSchema } from '../src/network/zone.js';

/* * */

const resources = [
	{ create: CreateAnnotationSchema, name: 'annotations', update: UpdateAnnotationSchema },
	{ create: CreateHolidaySchema, name: 'holidays', update: UpdateHolidaySchema },
	{ create: CreateEventSchema, name: 'events', update: UpdateEventSchema },
	{ create: CreateYearPeriodSchema, name: 'year periods', update: UpdateYearPeriodSchema },
	{ create: CreateZoneSchema, name: 'zones', update: UpdateZoneSchema },
	{ create: CreateTypologySchema, name: 'typologies', update: UpdateTypologySchema },
	{ create: CreateFareSchema, name: 'fares', update: UpdateFareSchema },
];

/* * */

for (const { create, name, update } of resources) {
	describe(`${name} agency requirements`, () => {
		test('creation requires at least one agency', () => {
			const fields = { code: 'CODE', name: 'Record', title: 'Record' };
			assert.equal(create.safeParse(fields).success, false);
			assert.equal(create.safeParse({ ...fields, agency_ids: [] }).success, false);
			assert.equal(create.safeParse({ ...fields, agency_ids: ['A'] }).success, true);
		});

		test('updates can omit agencies without clearing them', () => {
			assert.equal(update.safeParse({}).success, true);
		});

		test('updates reject clearing agencies and accept a non-empty replacement', () => {
			assert.equal(update.safeParse({ agency_ids: [] }).success, false);
			assert.equal(update.safeParse({ agency_ids: ['A', 'B'] }).success, true);
		});
	});
}
