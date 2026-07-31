/* * */

import {
	buildPassengerDemandSnapshot,
	getComparableOperationalDates,
} from '@/tasks/passenger-demand.js';
import { Dates } from '@tmlmobilidade/dates';
import {
	PassengerDemandByAgencyByMinuteSchema,
	PassengerDemandRealtimeSchema,
} from '@tmlmobilidade/go-types-performance';
import { validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';

/* * */

const currentStart = Dates
	.fromOperationalDate('20260729', 'Europe/Lisbon')
	.unix_timestamp;
const realtime = PassengerDemandRealtimeSchema.parse({
	agency_id: 'agency-a',
	calculated_at: currentStart + 60 * 60 * 1_000,
	current_cutoff: currentStart + 61 * 60 * 1_000 - 1,
	current_operational_date: 20260729,
	definition_version: 'passenger-demand-v2',
	last_week_cutoff: currentStart - 7 * 24 * 60 * 60 * 1_000 + 61 * 60 * 1_000 - 1,
	last_week_operational_date: 20260722,
	passenger_validations_qty_last_week: 10,
	passenger_validations_qty_now: 15,
	source_watermark: currentStart + 59 * 60 * 1_000,
});
const comparableOperationalDates = getComparableOperationalDates(
	validateOperationalDateInt(20260729),
);
const facts = [
	PassengerDemandByAgencyByMinuteSchema.parse({
		accepted_validations_qty: 10,
		agency_id: 'agency-a',
		calculated_at: realtime.calculated_at,
		definition_version: 'passenger-demand-v2',
		interval_start: currentStart,
		operational_date: 20260729,
		source_watermark: realtime.source_watermark,
	}),
	PassengerDemandByAgencyByMinuteSchema.parse({
		accepted_validations_qty: 5,
		agency_id: 'agency-a',
		calculated_at: realtime.calculated_at,
		definition_version: 'passenger-demand-v2',
		interval_start: currentStart + 60 * 1_000,
		operational_date: 20260729,
		source_watermark: realtime.source_watermark,
	}),
	PassengerDemandByAgencyByMinuteSchema.parse({
		accepted_validations_qty: 999,
		agency_id: 'agency-a',
		calculated_at: realtime.calculated_at,
		definition_version: 'passenger-demand-v2',
		interval_start: currentStart + 61 * 60 * 1_000,
		operational_date: 20260729,
		source_watermark: realtime.source_watermark,
	}),
	...comparableOperationalDates.slice(0, 3).map((operationalDate, index) =>
		PassengerDemandByAgencyByMinuteSchema.parse({
			accepted_validations_qty: 20 + index,
			agency_id: 'agency-a',
			calculated_at: realtime.calculated_at,
			definition_version: 'passenger-demand-v2',
			interval_start: currentStart - (index + 1) * 7 * 24 * 60 * 60 * 1_000,
			operational_date: operationalDate,
			source_watermark: realtime.source_watermark,
		}),
	),
];

const snapshot = buildPassengerDemandSnapshot(
	[realtime],
	facts,
	realtime.calculated_at,
);

assert.deepEqual(
	snapshot.agencies['agency-a']?.comparable_days.map(day => day.operational_date),
	[20260722, 20260715, 20260708],
);
assert.deepEqual(
	comparableOperationalDates,
	[20260722, 20260715, 20260708, 20260701, 20260624, 20260617, 20260610, 20260603],
);
assert.deepEqual(
	getComparableOperationalDates(validateOperationalDateInt(20260105), 3),
	[20251229, 20251222, 20251215],
);
assert.equal(snapshot.agencies['agency-a']?.current_points[0]?.passenger_validations_qty, 15);
assert.equal(snapshot.agencies['agency-a']?.current_points.length, 1);
assert.equal(snapshot.agencies['agency-a']?.realtime.comparison_index_pct, 150);
assert.equal(snapshot.meta.interval_minutes, 15);
assert.equal(snapshot.meta.source_watermark, realtime.source_watermark);

console.log('Passenger demand publishing tests passed.');
