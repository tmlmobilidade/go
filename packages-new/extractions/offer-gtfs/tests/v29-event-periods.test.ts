import { EventSchema, PatternSchema, YearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { createOfferTranslator } from '@tmlmobilidade/go-utils-offer';
import { CsvWriter } from '@tmlmobilidade/writers';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { exportCalendarDates } from '../src/versions/v29/exports/calendar-dates.js';
import { debugResolvePatternTripRows } from '../src/versions/v29/exports/trips.js';
import { type GtfsV29ExportConfig } from '../src/versions/v29/types.js';
import { createV29PeriodResolver } from '../src/versions/v29/utils/period-mapping.js';
import { ServiceRegistry } from '../src/versions/v29/utils/service-registry.js';

const date = OperationalDateIntSchema.parse(20270322);
const nextDate = OperationalDateIntSchema.parse(20270323);
const agencyId = 'agency';
const document = { created_at: 1_700_000_000_000, created_by: 'test', updated_at: 1_700_000_000_000, updated_by: 'test' };
const periods = [
	YearPeriodSchema.parse({ ...document, _id: 'school', agency_ids: [agencyId], code: '1', dates: [date], name: 'School', short_name: 'ESC' }),
	YearPeriodSchema.parse({ ...document, _id: 'holidays', agency_ids: [agencyId], code: '2', dates: [nextDate], name: 'Holidays', short_name: 'FER' }),
	YearPeriodSchema.parse({ ...document, _id: 'summer', agency_ids: [agencyId], code: '3', dates: [], name: 'Summer', short_name: 'VER' }),
];
const pattern = PatternSchema.parse({
	...document,
	_id: 'pattern', code: '4426_0_2', destination: 'Destination', headsign: 'Destination', line_id: 'line', origin: 'Origin', route_id: 'route',
	rules: [{ _id: 'manual', kind: 'manual', operating_mode: 'include', timepoints: ['07:50'], weekdays: [1, 2, 3, 4, 5], year_period_ids: ['holidays', 'summer'] }],
});
const event = EventSchema.parse({
	...document,
	_id: 'easter', agency_ids: [agencyId], code: 'PASCOA', dates: [date], rules: [{ _id: 'replacement', dates: [date], kind: 'event_replacement', lines_mode: 'all', same_weekday: true, weekdays: [], year_period_ids: ['holidays'] }],
	title: 'Easter',
});
const t = await createOfferTranslator('pt');

function resolve(events = [event], inputPattern = pattern) {
	const registry = new ServiceRegistry();
	const rows = debugResolvePatternTripRows(inputPattern, periods, [], events, Dates.fromOperationalDateInt(date, 'Europe/Lisbon'), Dates.fromOperationalDateInt(nextDate, 'Europe/Lisbon'), registry, 'pt', t, agencyId);
	return { registry, rows };
}

test('exports a multi-period manual on a replacement date using the event period', () => {
	const { registry, rows } = resolve();
	assert.equal(rows.length, 1);
	assert.deepEqual([...rows[0].dates], [date, nextDate]);
	assert.equal(rows[0].timepoint, '07:50');
	const service = registry.getAllServices().get(rows[0].serviceId);
	assert.ok(service);
	assert.deepEqual(service.periodIds, ['holidays', 'summer']);
	assert.deepEqual([...service.periodOverrides], [[date, '2']]);
	const resolvePeriod = createV29PeriodResolver(agencyId, periods);
	assert.equal(service.periodOverrides.get(date), '2');
	assert.equal(resolvePeriod(nextDate, service.periodIds), '2');
	assert.throws(() => resolvePeriod(date, service.periodIds), /no Period/);
});

test('ordinary dates keep their service identity and have no override', () => {
	const { registry, rows } = resolve([]);
	assert.deepEqual([...rows[0].dates], [nextDate]);
	const service = registry.getAllServices().get(rows[0].serviceId);
	assert.ok(service);
	assert.equal(service.periodOverrides.size, 0);
	// Identity produced by the exporter before event period overrides were introduced.
	assert.equal(registry.getOrCreateServiceId(new Set([nextDate]), agencyId, service.periodIds), 'SVC_dbe1eb2c8b7a');
});

test('service deduplication separates different effective period mappings', () => {
	const registry = new ServiceRegistry();
	const dates = new Set([date, nextDate]);
	const selected = ['holidays', 'summer'];
	const ordinary = registry.getOrCreateServiceId(dates, agencyId, selected);
	const holiday = registry.getOrCreateServiceId(dates, agencyId, selected, new Map([[date, '2']]));
	const summer = registry.getOrCreateServiceId(dates, agencyId, selected, new Map([[date, '3']]));
	assert.equal(new Set([holiday, ordinary, summer]).size, 3);
	assert.equal(holiday, registry.getOrCreateServiceId(dates, agencyId, selected, new Map([[date, '2']])));
	registry.registerServiceId('token', dates, agencyId, selected, new Map([[date, '2']]));
	assert.throws(() => registry.registerServiceId('token', dates, agencyId, selected, new Map([[date, '3']])), /different effective Periods/);
});

test('missing and ambiguous ordinary periods still fail', () => {
	const resolvePeriod = createV29PeriodResolver(agencyId, periods);
	assert.throws(() => resolvePeriod(date, ['missing']), /missing or outside agency/);
	assert.throws(() => resolvePeriod(date, ['holidays', 'summer']), /no Period/);
	const overlapping = periods.map(period => ({ ...period, dates: [date] }));
	assert.throws(() => createV29PeriodResolver(agencyId, overlapping)(date, ['holidays', 'summer']), /conflicting Periods/);
	const invalid = { ...pattern, rules: pattern.rules.map(rule => ({ ...rule, year_period_ids: ['holidays', 'missing'] })) };
	assert.throws(() => resolve([event], invalid), /Period missing is outside the agency scope or missing/);
});

test('single-period replacement results do not gain redundant overrides', () => {
	const input = { ...pattern, rules: pattern.rules.map(rule => ({ ...rule, year_period_ids: ['holidays'] })) };
	const { registry } = resolve([event], input);
	assert.equal([...registry.getAllServices().values()][0].periodOverrides.size, 0);
});

test('calendar_dates writes the explicit replacement period', async () => {
	const workdir = mkdtempSync(path.join(tmpdir(), 'gtfs-event-periods-'));
	const config: GtfsV29ExportConfig = {
		agency_ids: [agencyId], calendars_clip_end_date: nextDate, calendars_clip_start_date: date, clip_calendars: true,
		feed_end_date: nextDate, feed_start_date: date, lines_exclude: [], lines_include: [], numeric_calendar_codes: false,
		stop_sequence_start: 1, stops_export_all: false, stops_location_filter: {}, version: 'test', workdir,
		writers: {
			afetacao: new CsvWriter('afetacao.csv', path.join(workdir, 'afetacao.csv')),
			agency: new CsvWriter('agency.txt', path.join(workdir, 'agency.txt')),
			calendar_dates: new CsvWriter('calendar_dates.txt', path.join(workdir, 'calendar_dates.txt')),
			fare_attributes: new CsvWriter('fare_attributes.txt', path.join(workdir, 'fare_attributes.txt')),
			fare_rules: new CsvWriter('fare_rules.txt', path.join(workdir, 'fare_rules.txt')),
			feed_info: new CsvWriter('feed_info.txt', path.join(workdir, 'feed_info.txt')),
			routes: new CsvWriter('routes.txt', path.join(workdir, 'routes.txt')),
			shapes: new CsvWriter('shapes.txt', path.join(workdir, 'shapes.txt')),
			stop_times: new CsvWriter('stop_times.txt', path.join(workdir, 'stop_times.txt')),
			stops: new CsvWriter('stops.txt', path.join(workdir, 'stops.txt')),
			trips: new CsvWriter('trips.txt', path.join(workdir, 'trips.txt')),

		},
	};
	try {
		const { registry } = resolve();
		await exportCalendarDates(registry, new Map(periods.map(period => [period._id, period])), new Map(), config);
		await config.writers.calendar_dates.flush();
		const [header, ...rows] = readFileSync(path.join(workdir, 'calendar_dates.txt'), 'utf8').trim().split('\n').map(line => line.trim().split(','));
		assert.equal(rows.length, 2);
		for (const row of rows) assert.equal(row[header.indexOf('period')], '2');
	} finally {
		rmSync(workdir, { force: true, recursive: true });
	}
});
