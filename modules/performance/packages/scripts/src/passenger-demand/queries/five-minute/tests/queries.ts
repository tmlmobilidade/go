/* * */

import { PassengerDemandOverTimeQueryInputSchema } from '@tmlmobilidade/go-types-performance';
import { validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import test from 'node:test';

import { buildFiveMinutePassengerDemandByLineQuery } from '../demand-by-line.js';
import { buildFiveMinutePassengerDemandByPatternQuery } from '../demand-by-pattern.js';
import { buildFiveMinutePassengerDemandByStopQuery } from '../demand-by-stop.js';
import { buildFiveMinutePassengerDemandComparisonQuery, calculateFiveMinutePassengerDemandComparison } from '../demand-comparison.js';
import { buildFiveMinutePassengerDemandOverTimeQuery } from '../demand-over-time.js';
import { buildFiveMinutePassengerDemandTotalQuery } from '../demand-total.js';

/* * */

const DATE_20260725 = validateOperationalDateInt(20260725);
const DATE_20260731 = validateOperationalDateInt(20260731);
const DATE_20260801 = validateOperationalDateInt(20260801);
const DATE_20260807 = validateOperationalDateInt(20260807);

/* * */

test('builds a bounded demand-total query without FINAL', () => {
	const result = buildFiveMinutePassengerDemandTotalQuery({
		agency_ids: ['41'],
		end_date: DATE_20260807,
		start_date: DATE_20260801,
	});

	assert.match(result.query, /sum\(accepted_validations_qty\).*AS passenger_demand/);
	assert.match(result.query, /agency_id IN \$4/);
	assert.doesNotMatch(result.query, /FINAL/);
	assert.deepEqual(result.params, {
		1: 'passenger-demand-v2',
		2: 20260801,
		3: 20260807,
		4: ['41'],
	});
});

test('builds a filtered hourly demand-over-time query', () => {
	const result = buildFiveMinutePassengerDemandOverTimeQuery({
		data_statuses: ['reconciled'],
		end_date: DATE_20260807,
		line_ids: ['4701', '4702'],
		start_date: DATE_20260801,
		time_grain: 'hour',
	});

	assert.match(result.query, /intDiv\(interval_start, 3600000\) \* 3600000 AS period/);
	assert.match(result.query, /line_id IN \$4/);
	assert.match(result.query, /data_status IN \$5/);
});

test('supports overnight local-hour filters', () => {
	const result = buildFiveMinutePassengerDemandOverTimeQuery({
		end_date: DATE_20260807,
		hour_end: 3,
		hour_start: 22,
		start_date: DATE_20260801,
		time_grain: '5_minutes',
	});

	assert.match(result.query, /toHour\(fromUnixTimestamp64Milli\(interval_start, 'Europe\/Lisbon'\)\) >= \$4/);
	assert.match(result.query, /toHour\(fromUnixTimestamp64Milli\(interval_start, 'Europe\/Lisbon'\)\) <= \$5/);
});

test('rejects incomplete hour ranges', () => {
	assert.throws(
		() => PassengerDemandOverTimeQueryInputSchema.parse({
			end_date: DATE_20260807,
			hour_start: 8,
			start_date: DATE_20260801,
			time_grain: 'hour',
		}),
		/hour_start and hour_end must be provided together/,
	);
});

test('builds explicit line, pattern, and stop breakdowns', () => {
	const filters = {
		end_date: DATE_20260807,
		exclude_unknown: true,
		limit: 25,
		start_date: DATE_20260801,
	};
	const line = buildFiveMinutePassengerDemandByLineQuery(filters);
	const pattern = buildFiveMinutePassengerDemandByPatternQuery({ ...filters, line_ids: ['4701'] });
	const stop = buildFiveMinutePassengerDemandByStopQuery({ ...filters, pattern_ids: ['4701_0_1'] });

	assert.match(line.query, /agency_id, line_id/);
	assert.match(line.query, /line_id,/);
	assert.match(line.query, /GROUP BY agency_id, line_id/);
	assert.match(pattern.query, /pattern_id,/);
	assert.match(pattern.query, /line_id IN \$4/);
	assert.match(stop.query, /stop_id,/);
	assert.match(stop.query, /pattern_id IN \$4/);
	assert.match(stop.query, /LIMIT 25/);
});

test('builds and calculates an explicit period comparison', () => {
	const result = buildFiveMinutePassengerDemandComparisonQuery({
		comparison_period: { end_date: DATE_20260731, start_date: DATE_20260725 },
		current_period: { end_date: DATE_20260807, start_date: DATE_20260801 },
		pattern_ids: ['4701_0_1'],
	});

	assert.match(result.query, /sumIf/);
	assert.match(result.query, /pattern_id IN \$6/);
	assert.deepEqual(calculateFiveMinutePassengerDemandComparison({
		comparison_qty: '80',
		current_qty: '100',
	}), {
		comparison_qty: 80,
		current_qty: 100,
		difference_pct: 25,
		difference_qty: 20,
	});
});

/* * */
