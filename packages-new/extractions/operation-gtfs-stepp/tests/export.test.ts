/* * */

import { streamCsvFile } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { exportPlanGtfs, writeSharedFiles } from '../src/main.js';
import { createSteppWriters } from '../src/writers.js';

/* * */

type CsvRow = Record<string, string | undefined>;
type FeedFiles = Record<string, string>;
type ExportOptions = Parameters<typeof exportPlanGtfs>[0];

const OUTPUT_FILES = ['agency.txt', 'calendar.txt', 'calendar_dates.txt', 'routes.txt', 'routes_stepp.txt', 'shapes.txt', 'stop_times.txt', 'stops.txt', 'trips.txt'];

function makeFeed(): FeedFiles {
	return {
		'agency.txt': 'agency_id,agency_name,agency_url,agency_timezone,agency_lang,agency_phone,agency_fare_url,agency_email\n41,Operator,https://example.com,Europe/Lisbon,pt,123456789,https://example.com/fares,operator@example.com\n',
		'calendar_dates.txt': 'service_id,date,exception_type\n',
		'calendar.txt': 'service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\nservice,1,1,1,1,1,0,0,20261001,20261031\n',
		'routes.txt': 'route_id,agency_id,route_short_name,route_long_name,route_desc,route_type\n1009,41,1009,Terminal A - Terminal B,Source route description,3\n',
		'shapes.txt': 'shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence,shape_dist_traveled\nshape,38.700,-9.100,1,0\nshape,38.710,-9.110,2,1750.5\n',
		'stop_times.txt': 'trip_id,arrival_time,departure_time,stop_id,stop_sequence,shape_dist_traveled,stop_headsign,pickup_type,drop_off_type,continuous_pickup,continuous_drop_off,timepoint\ntrip,25:10:00,25:10:30,A,10,0,Terminal B,0,1,1,1,1\ntrip,25:20:45,25:21:15,B,20,1750.5,Terminal B,1,0,1,1,0\n',
		'stops.txt': 'stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon,zone_id\nA,001,"Terminal, A","Source ""A"" description",38.700,-9.100,Z1\nB,002,Terminal B,Source B description,38.710,-9.110,Z2\n',
		'trips.txt': 'route_id,service_id,trip_id,trip_headsign,direction_id,shape_id,bikes_allowed,wheelchair_accessible,block_id,trip_short_name\n1009,service,trip,Terminal B,1,shape,2,1,block,Source trip\n',
	};
}

async function writeFeed(directory: string, files: FeedFiles) {
	await mkdir(directory, { recursive: true });
	await Promise.all(Object.entries(files).map(([name, content]) => writeFile(path.join(directory, name), content)));
}

async function readRows(directory: string, fileName: string): Promise<CsvRow[]> {
	const rows: CsvRow[] = [];
	await streamCsvFile<CsvRow>(path.join(directory, fileName), async (row) => {
		rows.push(row);
	});
	return rows;
}

async function withExport(callback: (options: ExportOptions, outputDirectory: string, directory: string) => Promise<void>, files = makeFeed()) {
	const directory = await mkdtemp(path.join(os.tmpdir(), 'operation-stepp-export-'));
	const sourceDirectory = path.join(directory, 'source');
	const outputDirectory = path.join(directory, 'output');
	await writeFeed(sourceDirectory, files);
	const writers = await createSteppWriters(outputDirectory);
	try {
		await callback({
			agencyCode: '41',
			endDate: '20261007',
			planActiveFrom: 20261001,
			planCreatedAt: 1,
			planId: 'plan',
			sharedRows: new Map(),
			sourceDirectory,
			startDate: '20261005',
			writers,
		}, outputDirectory, directory);
	} finally {
		await Promise.all(Object.values(writers).map(writer => writer.close()));
		await rm(directory, { force: true, recursive: true });
	}
}

async function closeWriters(options: ExportOptions) {
	await writeSharedFiles(options.sharedRows, options.writers);
	await Promise.all(Object.values(options.writers).map(writer => writer.close()));
}

/* * */

test('preserves normalized schedules and exports only services and references active in the selected range', async () => {
	const files = makeFeed();
	files['calendar.txt'] += 'removed,1,0,0,0,0,0,0,20261001,20261031\noutside,1,1,1,1,1,0,0,20261008,20261031\nunreferenced,1,1,1,1,1,0,0,20261001,20261031\n';
	files['calendar_dates.txt'] += 'service,20261006,2\nservice,20261008,1\nextra,20261006,1\nremoved,20261005,2\n';
	files['trips.txt'] += '1009,extra,extra-trip,Terminal B,1,shape,0,0,,\nunused-route,removed,removed-trip,Unused,0,unused-shape,0,0,,\nunused-route,outside,outside-trip,Unused,0,unused-shape,0,0,,\n';
	files['routes.txt'] += 'unused-route,41,9999,Unused,Unused route,3\n';
	files['stop_times.txt'] += 'extra-trip,09:00:00,09:00:00,A,1,0,,0,0,,,1\nextra-trip,09:10:00,09:10:00,B,2,1750.5,,0,0,,,1\nremoved-trip,10:00:00,10:00:00,unused-stop,1,0,,0,0,,,1\noutside-trip,10:00:00,10:00:00,unused-stop,1,0,,0,0,,,1\n';
	files['shapes.txt'] += 'unused-shape,38.720,-9.120,1,0\n';
	files['stops.txt'] += 'unused-stop,999,Unused,Unused,38.720,-9.120,\n';
	files['calendar_stepp.txt'] = 'service_id,monday_holiday\nservice,1\n';

	await withExport(async (options, outputDirectory) => {
		assert.equal(await exportPlanGtfs(options), 2);
		await closeWriters(options);

		assert.deepEqual((await readdir(outputDirectory)).sort(), OUTPUT_FILES);
		const trips = await readRows(outputDirectory, 'trips.txt');
		assert.deepEqual(trips.map(row => row.trip_id).sort(), ['extra-trip', 'trip']);
		assert.deepEqual(trips.find(row => row.trip_id === 'trip'), {
			bikes_allowed: '2',
			block_id: 'block',
			direction_id: '1',
			route_id: '1009',
			service_id: 'service',
			shape_id: 'shape',
			trip_headsign: 'Terminal B',
			trip_id: 'trip',
			trip_short_name: 'Source trip',
			wheelchair_accessible: '1',
		});

		const stopTimes = await readRows(outputDirectory, 'stop_times.txt');
		assert.deepEqual(stopTimes.filter(row => row.trip_id === 'trip'), [
			{ arrival_time: '25:10:00', continuous_drop_off: '1', continuous_pickup: '1', departure_time: '25:10:30', drop_off_type: '1', pickup_type: '0', shape_dist_traveled: '0', stop_headsign: 'Terminal B', stop_id: 'A', stop_sequence: '10', timepoint: '1', trip_id: 'trip' },
			{ arrival_time: '25:20:45', continuous_drop_off: '1', continuous_pickup: '1', departure_time: '25:21:15', drop_off_type: '0', pickup_type: '1', shape_dist_traveled: '1750.5', stop_headsign: 'Terminal B', stop_id: 'B', stop_sequence: '20', timepoint: '0', trip_id: 'trip' },
		]);

		const dates = await readRows(outputDirectory, 'calendar_dates.txt');
		assert.deepEqual(dates.map(row => `${row.service_id}:${row.date}:${row.exception_type}`).sort(), ['extra:20261006:1', 'service:20261005:1', 'service:20261007:1']);
		const calendar = await readRows(outputDirectory, 'calendar.txt');
		assert.deepEqual(calendar.map(row => row.service_id).sort(), ['extra', 'service']);
		assert.equal(calendar.find(row => row.service_id === 'service')?.start_date, '20261005');
		assert.equal(calendar.find(row => row.service_id === 'service')?.end_date, '20261007');
		assert.equal(calendar.find(row => row.service_id === 'service')?.tuesday, '0');

		assert.deepEqual((await readRows(outputDirectory, 'routes.txt')).map(row => row.route_id), ['1009']);
		const stops = await readRows(outputDirectory, 'stops.txt');
		assert.deepEqual(stops.map(row => row.stop_id).sort(), ['A', 'B']);
		assert.equal(stops.find(row => row.stop_id === 'A')?.stop_desc, 'Source "A" description');
		assert.deepEqual((await readRows(outputDirectory, 'shapes.txt')).map(row => row.shape_dist_traveled), ['0', '1750.5']);
		assert.ok(stopTimes.every(row => trips.some(trip => trip.trip_id === row.trip_id) && stops.some(stop => stop.stop_id === row.stop_id)));
	}, files);
});

test('uses source STePP route metadata when the plan supplies it', async () => {
	const files = makeFeed();
	files['routes_stepp.txt'] = 'route_id,route_origin,route_destination,circular,path_type,contract\n1009,Source origin,Source destination,0,3,Source contract\n';
	await withExport(async (options, outputDirectory) => {
		await exportPlanGtfs(options);
		await closeWriters(options);
		assert.deepEqual(await readRows(outputDirectory, 'routes_stepp.txt'), [{
			circular: '0',
			contract: 'Source contract',
			path_type: '3',
			route_destination: 'Source destination',
			route_id: '1009',
			route_origin: 'Source origin',
		}]);
	}, files);
});

test('preserves each supplied STePP route row once across circular and noncircular patterns', async () => {
	const files = makeFeed();
	files['trips.txt'] += '1009,service,circular-trip,Terminal A,0,circular-shape,0,0,,\n';
	files['stop_times.txt'] += 'circular-trip,10:00:00,10:00:00,A,1,0,,0,0,,,1\ncircular-trip,10:10:00,10:10:00,B,2,900,,0,0,,,1\ncircular-trip,10:20:00,10:20:00,A,3,1750.5,,0,0,,,1\n';
	files['shapes.txt'] += 'circular-shape,38.700,-9.100,1,0\ncircular-shape,38.710,-9.110,2,900\ncircular-shape,38.700,-9.100,3,1750.5\n';
	files['routes_stepp.txt'] = 'route_id,route_origin,route_destination,circular,path_type,contract\n1009,Loop origin,Loop destination,1,2,Loop contract\n1009,Direct origin,Direct destination,0,3,Direct contract\n';
	await withExport(async (options, outputDirectory) => {
		assert.equal(await exportPlanGtfs(options), 2);
		await closeWriters(options);
		assert.deepEqual(await readRows(outputDirectory, 'routes_stepp.txt'), [
			{ circular: '1', contract: 'Loop contract', path_type: '2', route_destination: 'Loop destination', route_id: '1009', route_origin: 'Loop origin' },
			{ circular: '0', contract: 'Direct contract', path_type: '3', route_destination: 'Direct destination', route_id: '1009', route_origin: 'Direct origin' },
		]);
	}, files);
});

test('derives missing route metadata from the exported stops and agency', async () => {
	await withExport(async (options, outputDirectory) => {
		await exportPlanGtfs(options);
		await closeWriters(options);
		assert.deepEqual(await readRows(outputDirectory, 'routes_stepp.txt'), [{
			circular: '0',
			contract: 'TML 24/2020',
			path_type: '1',
			route_destination: 'Terminal B',
			route_id: '1009',
			route_origin: 'Terminal, A',
		}]);
	});
});

test('derives circularity from stop sequence rather than source row order', async () => {
	const files = makeFeed();
	files['stop_times.txt'] = 'trip_id,arrival_time,departure_time,stop_id,stop_sequence,shape_dist_traveled\ntrip,10:10:00,10:10:00,B,20,900\ntrip,10:00:00,10:00:00,A,10,0\ntrip,10:20:00,10:20:00,A,30,1750.5\n';
	await withExport(async (options, outputDirectory) => {
		await exportPlanGtfs(options);
		await closeWriters(options);
		const rows = await readRows(outputDirectory, 'routes_stepp.txt');
		assert.equal(rows[0].circular, '1');
		assert.equal(rows[0].route_origin, 'Terminal, A');
		assert.equal(rows[0].route_destination, 'Terminal, A');
	}, files);
});

for (const newestFirst of [false, true]) {
	test(`preserves original IDs across two months and replaces complete groups with the latest plan processed ${newestFirst ? 'first' : 'last'}`, async () => {
		const oldFeed = makeFeed();
		oldFeed['stop_times.txt'] += 'trip,25:30:00,25:30:00,A,30,2000,,0,0,,,1\n';
		oldFeed['shapes.txt'] += 'shape,38.720,-9.120,3,2000\n';
		await withExport(async (options, outputDirectory, directory) => {
			const newerFeed = makeFeed();
			newerFeed['calendar.txt'] = newerFeed['calendar.txt'].replaceAll('202610', '202611').replace('20261131', '20261130');
			newerFeed['stop_times.txt'] = newerFeed['stop_times.txt'].replaceAll('25:', '26:');
			newerFeed['shapes.txt'] = newerFeed['shapes.txt'].replace('38.710', '38.715');
			newerFeed['trips.txt'] = newerFeed['trips.txt'].replace('Source trip', 'Latest trip');
			const newerSource = path.join(directory, 'newer-source');
			await writeFeed(newerSource, newerFeed);
			const older = { ...options, planId: 'E468Y' };
			const newer = { ...options, endDate: '20261104', planActiveFrom: 20261101, planId: 'LI43M', sourceDirectory: newerSource, startDate: '20261102' };
			for (const plan of newestFirst ? [newer, older] : [older, newer]) {
				await exportPlanGtfs(plan);
				await Promise.all(Object.values(options.writers).map(writer => writer.close()));
			}
			await closeWriters(options);

			assert.deepEqual((await readdir(outputDirectory)).sort(), OUTPUT_FILES);
			const trips = await readRows(outputDirectory, 'trips.txt');
			assert.equal(trips.length, 1);
			assert.equal(trips[0].trip_id, 'trip');
			assert.equal(trips[0].service_id, 'service');
			assert.equal(trips[0].shape_id, 'shape');
			assert.equal(trips[0].block_id, 'block');
			assert.equal(trips[0].trip_short_name, 'Latest trip');
			const calendar = await readRows(outputDirectory, 'calendar.txt');
			assert.equal(calendar.length, 1);
			assert.equal(calendar[0].start_date, '20261005');
			assert.equal(calendar[0].end_date, '20261104');
			const dates = await readRows(outputDirectory, 'calendar_dates.txt');
			assert.deepEqual(dates.map(row => row.date), ['20261005', '20261006', '20261007', '20261102', '20261103', '20261104']);
			assert.ok(dates.every(row => row.service_id === 'service'));
			const shapes = await readRows(outputDirectory, 'shapes.txt');
			assert.equal(shapes.length, 2);
			assert.ok(shapes.every(row => row.shape_id === 'shape'));
			assert.equal(shapes[1].shape_pt_lat, '38.715');
			const stopTimes = await readRows(outputDirectory, 'stop_times.txt');
			assert.equal(stopTimes.length, 2);
			assert.ok(stopTimes.every(row => row.trip_id === 'trip' && row.arrival_time?.startsWith('26:')));
			assert.equal((await readRows(outputDirectory, 'routes_stepp.txt')).length, 1);
		}, oldFeed);
	});
}

for (const newestFirst of [false, true]) {
	test(`uses the latest service dates on overlaps, including removals, processed ${newestFirst ? 'first' : 'last'}`, async () => {
		await withExport(async (options, outputDirectory, directory) => {
			const newerFeed = makeFeed();
			newerFeed['calendar_dates.txt'] += 'service,20261006,2\nservice,20261008,1\n';
			const newerSource = path.join(directory, 'newer-source');
			await writeFeed(newerSource, newerFeed);
			const older = { ...options, planId: 'older' };
			const newer = { ...options, endDate: '20261008', planActiveFrom: 20261006, planId: 'newer', sourceDirectory: newerSource, startDate: '20261006' };
			for (const plan of newestFirst ? [newer, older] : [older, newer]) await exportPlanGtfs(plan);
			await closeWriters(options);
			assert.deepEqual((await readRows(outputDirectory, 'calendar_dates.txt')).map(row => row.date), ['20261005', '20261007', '20261008']);
			assert.equal((await readRows(outputDirectory, 'calendar.txt')).length, 1);
		});
	});
}

for (const newestFirst of [false, true]) {
	test(`preserves distinct IDs and uses newer shared shapes processed ${newestFirst ? 'first' : 'last'}`, async () => {
		await withExport(async (options, outputDirectory, directory) => {
			const newerFeed = makeFeed();
			newerFeed['trips.txt'] = newerFeed['trips.txt'].replace('1009,service,trip,', '1009,new-service,new-trip,');
			newerFeed['calendar.txt'] = newerFeed['calendar.txt'].replace('service,', 'new-service,');
			newerFeed['stop_times.txt'] = newerFeed['stop_times.txt'].replaceAll('\ntrip,', '\nnew-trip,');
			newerFeed['shapes.txt'] = newerFeed['shapes.txt'].replace('38.710', '38.715');
			const newerSource = path.join(directory, 'newer-source');
			await writeFeed(newerSource, newerFeed);
			const older = { ...options, planId: 'older' };
			const newer = { ...options, planActiveFrom: 20261005, planId: 'newer', sourceDirectory: newerSource };
			for (const plan of newestFirst ? [newer, older] : [older, newer]) await exportPlanGtfs(plan);
			await closeWriters(options);
			assert.deepEqual((await readRows(outputDirectory, 'trips.txt')).map(row => row.trip_id).sort(), ['new-trip', 'trip']);
			assert.deepEqual((await readRows(outputDirectory, 'calendar.txt')).map(row => row.service_id).sort(), ['new-service', 'service']);
			assert.equal((await readRows(outputDirectory, 'calendar_dates.txt')).length, 6);
			assert.equal((await readRows(outputDirectory, 'stop_times.txt')).length, 4);
			const shapes = await readRows(outputDirectory, 'shapes.txt');
			assert.equal(shapes.length, 2);
			assert.equal(shapes[1].shape_pt_lat, '38.715');
		});
	});
}

for (const newestFirst of [false, true]) {
	test(`uses the latest plan's route and stop names when processed ${newestFirst ? 'first' : 'last'}`, async (context) => {
		const logs = context.mock.method(Logger, 'info', () => {});
		await withExport(async (options, outputDirectory, directory) => {
			const updated = makeFeed();
			updated['routes.txt'] = updated['routes.txt'].replace('1009,41,1009,Terminal A - Terminal B', '1009,41,New short name,New origin - Terminal B');
			updated['stops.txt'] = updated['stops.txt'].replace('B,002,Terminal B', 'B,002,Renamed terminal');
			const newerSource = path.join(directory, 'newer-source');
			await writeFeed(newerSource, updated);
			// Both plans have the same clipped dates; precedence uses their original active_from.
			const older = { ...options, planActiveFrom: 20261001, planCreatedAt: 20, planId: 'older' };
			const newer = { ...options, planActiveFrom: 20261005, planCreatedAt: 10, planId: 'newer', sourceDirectory: newerSource };
			const ordered = newestFirst ? [newer, older] : [older, newer];
			await exportPlanGtfs(ordered[0]);
			// Flushing streaming writers must not lock in an obsolete public definition.
			await Promise.all(Object.values(options.writers).map(writer => writer.close()));
			await exportPlanGtfs(ordered[1]);
			await closeWriters(options);

			const routes = await readRows(outputDirectory, 'routes.txt');
			assert.equal(routes.length, 1);
			assert.equal(routes[0].route_id, '1009');
			assert.equal(routes[0].route_short_name, 'New short name');
			assert.equal(routes[0].route_long_name, 'New origin - Terminal B');
			const stops = await readRows(outputDirectory, 'stops.txt');
			assert.equal(stops.length, 2);
			assert.equal(stops.find(row => row.stop_id === 'B')?.stop_name, 'Renamed terminal');
			const trips = await readRows(outputDirectory, 'trips.txt');
			assert.equal(trips.length, 1);
			assert.ok(trips.every(row => row.route_id === '1009'));
			const stopTimes = await readRows(outputDirectory, 'stop_times.txt');
			assert.equal(stopTimes.length, 2);
			assert.ok(stopTimes.every(row => stops.some(stop => stop.stop_id === row.stop_id)));
			const nameLogs = logs.mock.calls.map(call => call.arguments[0]).filter(log => typeof log === 'object' && !(log instanceof Error) && log.attributes?.event === 'operation_gtfs_stepp.definition_merge');
			assert.equal(nameLogs.length, 2);
			for (const log of nameLogs) {
				assert.ok(typeof log === 'object' && !(log instanceof Error));
				assert.equal(log.attributes?.chosen_plan_id, 'newer');
				assert.equal(log.attributes?.replaced, !newestFirst);
				assert.match(log.message ?? '', /using newer plan "newer"/);
			}
		});
	});
}

test('an identical newer plan prevents an older plan from reverting its names', async () => {
	await withExport(async (options, outputDirectory, directory) => {
		const intermediate = makeFeed();
		intermediate['trips.txt'] = intermediate['trips.txt'].replace('Source trip', 'Intermediate trip');
		intermediate['stop_times.txt'] = intermediate['stop_times.txt'].replaceAll('25:', '26:');
		intermediate['shapes.txt'] = intermediate['shapes.txt'].replace('38.710', '38.715');
		intermediate['routes.txt'] = intermediate['routes.txt'].replace('Terminal A - Terminal B', 'Intermediate route name');
		intermediate['stops.txt'] = intermediate['stops.txt'].replace('B,002,Terminal B', 'B,002,Intermediate stop name');
		const intermediateSource = path.join(directory, 'intermediate-source');
		await writeFeed(intermediateSource, intermediate);
		await exportPlanGtfs({ ...options, planActiveFrom: 20261001, planId: 'first' });
		await exportPlanGtfs({ ...options, planActiveFrom: 20261005, planId: 'latest' });
		await exportPlanGtfs({ ...options, planActiveFrom: 20261003, planId: 'intermediate', sourceDirectory: intermediateSource });
		await closeWriters(options);
		assert.equal((await readRows(outputDirectory, 'trips.txt'))[0].trip_short_name, 'Source trip');
		assert.equal((await readRows(outputDirectory, 'stop_times.txt'))[0].arrival_time, '25:10:00');
		assert.equal((await readRows(outputDirectory, 'shapes.txt'))[1].shape_pt_lat, '38.710');
		assert.equal((await readRows(outputDirectory, 'routes.txt'))[0].route_long_name, 'Terminal A - Terminal B');
		assert.equal((await readRows(outputDirectory, 'stops.txt')).find(row => row.stop_id === 'B')?.stop_name, 'Terminal B');
	});
});

for (const tie of [
	{ name: 'creation timestamp', newerCreatedAt: 2, newerId: 'A', olderCreatedAt: 1, olderId: 'Z' },
	{ name: 'plan ID', newerCreatedAt: 1, newerId: 'Z', olderCreatedAt: 1, olderId: 'A' },
]) {
	test(`breaks equal active_from ties by ${tie.name}`, async () => {
		await withExport(async (options, outputDirectory, directory) => {
			const newer = makeFeed();
			newer['trips.txt'] = newer['trips.txt'].replace('Source trip', 'Latest trip');
			newer['stop_times.txt'] = newer['stop_times.txt'].replaceAll('25:', '26:');
			newer['shapes.txt'] = newer['shapes.txt'].replace('38.710', '38.715');
			newer['routes.txt'] = newer['routes.txt'].replace('Terminal A - Terminal B', 'Latest route name');
			const newerSource = path.join(directory, 'newer-source');
			await writeFeed(newerSource, newer);
			await exportPlanGtfs({ ...options, planCreatedAt: tie.newerCreatedAt, planId: tie.newerId, sourceDirectory: newerSource });
			await exportPlanGtfs({ ...options, planCreatedAt: tie.olderCreatedAt, planId: tie.olderId });
			await closeWriters(options);
			assert.equal((await readRows(outputDirectory, 'trips.txt'))[0].trip_short_name, 'Latest trip');
			assert.equal((await readRows(outputDirectory, 'stop_times.txt'))[0].arrival_time, '26:10:00');
			assert.equal((await readRows(outputDirectory, 'shapes.txt'))[1].shape_pt_lat, '38.715');
			const routes = await readRows(outputDirectory, 'routes.txt');
			assert.equal(routes.length, 1);
			assert.equal(routes[0].route_long_name, 'Latest route name');
		});
	});
}

for (const conflict of [
	{ field: 'agency_name', fileName: 'agency.txt', from: 'Operator', to: 'Different operator' },
	{ field: 'route_desc', fileName: 'routes.txt', from: 'Source route description', to: 'Different route' },
	{ field: 'stop_desc', fileName: 'stops.txt', from: 'Source B description', to: 'Different stop description' },
]) {
	test(`uses the latest ${conflict.fileName} values for a repeated ID`, async (context) => {
		const logs = context.mock.method(Logger, 'info', () => {});
		await withExport(async (options, outputDirectory, directory) => {
			const updated = makeFeed();
			updated[conflict.fileName] = updated[conflict.fileName].replace(conflict.from, conflict.to);
			const otherSource = path.join(directory, 'updated-source');
			await writeFeed(otherSource, updated);
			await exportPlanGtfs({ ...options, planId: 'first' });
			await exportPlanGtfs({ ...options, planId: 'identical' });
			await exportPlanGtfs({ ...options, planActiveFrom: 20261005, planId: 'second', sourceDirectory: otherSource });
			await closeWriters(options);
			assert.ok((await readRows(outputDirectory, conflict.fileName)).some(row => row[conflict.field] === conflict.to));
			const mergeLogs = logs.mock.calls.map(call => call.arguments[0]).filter(log => typeof log === 'object' && !(log instanceof Error) && log.attributes?.event === 'operation_gtfs_stepp.definition_merge');
			assert.equal(mergeLogs.length, 1);
			const log = mergeLogs[0];
			assert.ok(typeof log === 'object' && !(log instanceof Error));
			assert.deepEqual(log.attributes?.differences, [{ current: conflict.to, field: conflict.field, previous: conflict.from }]);
			assert.equal(log.attributes?.previous_plan_id, 'identical');
			assert.equal(log.attributes?.chosen_plan_id, 'second');
		});
	});
}

for (const newestFirst of [false, true]) {
	test(`honors a newer service with no operating dates processed ${newestFirst ? 'first' : 'last'}`, async () => {
		await withExport(async (options, outputDirectory, directory) => {
			const newerFeed = makeFeed();
			newerFeed['calendar_dates.txt'] += 'service,20261005,2\nservice,20261006,2\nservice,20261007,2\n';
			const newerSource = path.join(directory, 'newer-source');
			await writeFeed(newerSource, newerFeed);
			const newer = { ...options, planActiveFrom: 20261005, planId: 'newer', sourceDirectory: newerSource };
			for (const plan of newestFirst ? [newer, options] : [options, newer]) await exportPlanGtfs(plan);
			await closeWriters(options);
			for (const file of ['trips.txt', 'stop_times.txt', 'calendar.txt', 'calendar_dates.txt']) {
				assert.deepEqual(await readRows(outputDirectory, file), []);
			}
		});
	});
}

test('replaces the complete STePP route extension group with the latest plan', async () => {
	const olderFeed = makeFeed();
	olderFeed['routes_stepp.txt'] = 'route_id,route_origin,route_destination,circular,path_type,contract\n1009,Old origin,Old destination,0,1,Old contract\n1009,Other origin,Other destination,0,1,Old contract\n';
	await withExport(async (options, outputDirectory, directory) => {
		const newerFeed = makeFeed();
		newerFeed['routes_stepp.txt'] = 'route_id,route_origin,route_destination,circular,path_type,contract\n1009,New origin,New destination,0,3,New contract\n';
		const newerSource = path.join(directory, 'newer-source');
		await writeFeed(newerSource, newerFeed);
		await exportPlanGtfs({ ...options, planActiveFrom: 20261005, planId: 'newer', sourceDirectory: newerSource });
		await exportPlanGtfs(options);
		await closeWriters(options);
		assert.deepEqual(await readRows(outputDirectory, 'routes_stepp.txt'), [{ circular: '0', contract: 'New contract', path_type: '3', route_destination: 'New destination', route_id: '1009', route_origin: 'New origin' }]);
	}, olderFeed);
});

test('keeps the numeric service IDs from the January example without plan prefixes', async () => {
	const olderFeed = makeFeed();
	const calendarHeader = olderFeed['calendar.txt'].split('\n')[0] + '\n';
	olderFeed['calendar.txt'] = calendarHeader;
	olderFeed['calendar_dates.txt'] += '26,20260101,1\n4,20260102,1\n5,20260103,1\n6,20260104,1\n';
	olderFeed['trips.txt'] = olderFeed['trips.txt'].split('\n')[0] + '\n' + ['26', '4', '5', '6'].map(id => `1009,${id},trip-${id},Terminal B,1,shape,2,1,block,Source trip\n`).join('');
	const sourceStopTimes = olderFeed['stop_times.txt'];
	olderFeed['stop_times.txt'] = sourceStopTimes.split('\n')[0] + '\n' + ['26', '4', '5', '6'].map(id => sourceStopTimes.split('\n').slice(1).join('\n').replaceAll('trip,', `trip-${id},`)).join('');
	await withExport(async (options, outputDirectory, directory) => {
		const newerFeed = makeFeed();
		newerFeed['calendar.txt'] = calendarHeader;
		newerFeed['calendar_dates.txt'] += '1,20260105,1\n1,20260106,1\n1,20260107,1\n1,20260108,1\n1,20260109,1\n';
		newerFeed['trips.txt'] = newerFeed['trips.txt'].replace('1009,service,trip,', '1009,1,trip,');
		const newerSource = path.join(directory, 'newer-source');
		await writeFeed(newerSource, newerFeed);
		await exportPlanGtfs({ ...options, endDate: '20260104', planActiveFrom: 20260101, planId: 'E468Y', startDate: '20260101' });
		await exportPlanGtfs({ ...options, endDate: '20260109', planActiveFrom: 20260105, planId: 'LI43M', sourceDirectory: newerSource, startDate: '20260105' });
		await closeWriters(options);
		const dates = await readRows(outputDirectory, 'calendar_dates.txt');
		assert.deepEqual(dates.sort((a, b) => String(a.date).localeCompare(String(b.date))).map(row => [row.date, row.exception_type, row.service_id]), [
			['20260101', '1', '26'], ['20260102', '1', '4'], ['20260103', '1', '5'], ['20260104', '1', '6'],
			['20260105', '1', '1'], ['20260106', '1', '1'], ['20260107', '1', '1'], ['20260108', '1', '1'], ['20260109', '1', '1'],
		]);
	}, olderFeed);
});

for (const reference of [
	{ fileName: 'routes.txt', id: '1009' },
	{ fileName: 'shapes.txt', id: 'shape' },
	{ fileName: 'stops.txt', id: 'A' },
]) {
	test(`rejects missing referenced ${reference.fileName} rows`, async () => {
		const files = makeFeed();
		files[reference.fileName] = `${files[reference.fileName].split('\n')[0]}\n`;
		await withExport(async (options) => {
			await assert.rejects(exportPlanGtfs(options), (error: unknown) => {
				assert.ok(error instanceof Error);
				assert.ok(error.message.includes(reference.id), error.message);
				return true;
			});
		}, files);
	});
}

for (const coordinate of ['stop_lat', 'stop_lon']) {
	for (const representation of ['blank', 'missing']) {
		test(`rejects a ${representation} ${coordinate} instead of converting it to zero`, async () => {
			const files = makeFeed();
			const columns = ['stop_id', 'stop_name', 'stop_lat', 'stop_lon'].filter(field => representation !== 'missing' || field !== coordinate);
			const rows = ['A', 'B'].map((id) => {
				const stop: Record<string, string> = { stop_id: id, stop_lat: '38.700', stop_lon: '-9.100', stop_name: `Stop ${id}` };
				if (representation === 'blank') stop[coordinate] = '';
				return columns.map(field => stop[field]).join(',');
			});
			files['stops.txt'] = `${columns.join(',')}\n${rows.join('\n')}\n`;
			await withExport(async (options) => {
				await assert.rejects(exportPlanGtfs(options), new RegExp(coordinate));
			}, files);
		});
	}
}

test('leaves valid header-only tables when a plan has no service within the selected dates', async () => {
	await withExport(async (options, outputDirectory) => {
		assert.equal(await exportPlanGtfs({ ...options, endDate: '20261102', startDate: '20261101' }), 0);
		await closeWriters(options);
		assert.deepEqual((await readdir(outputDirectory)).sort(), OUTPUT_FILES);
		for (const fileName of OUTPUT_FILES) assert.deepEqual(await readRows(outputDirectory, fileName), []);
	});
});
