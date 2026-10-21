/* * */

import { streamCsvFile } from '@tmlmobilidade/go-utils-exec';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { exportPlanGtfs } from '../src/main.js';
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
			namespaceIds: false,
			planId: 'plan',
			sharedRows: new Map<string, string>(),
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
	await Promise.all(Object.values(options.writers).map(writer => writer.close()));
}

function namespaced(planId: string, id: string) {
	return `plan_${encodeURIComponent(planId)}:${encodeURIComponent(id)}`;
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

test('merges plans with overlapping IDs while preserving every trip, calendar and shape reference', async () => {
	await withExport(async (options, outputDirectory, directory) => {
		const otherSource = path.join(directory, 'other-source');
		await writeFeed(otherSource, makeFeed());
		const planIds = ['first/plan', 'second:plan'];
		await exportPlanGtfs({ ...options, namespaceIds: true, planId: planIds[0] });
		await exportPlanGtfs({ ...options, namespaceIds: true, planId: planIds[1], sourceDirectory: otherSource });
		await closeWriters(options);

		const trips = await readRows(outputDirectory, 'trips.txt');
		const calendar = await readRows(outputDirectory, 'calendar.txt');
		const dates = await readRows(outputDirectory, 'calendar_dates.txt');
		const shapes = await readRows(outputDirectory, 'shapes.txt');
		const stopTimes = await readRows(outputDirectory, 'stop_times.txt');
		assert.deepEqual(trips.map(row => row.trip_id).sort(), planIds.map(id => namespaced(id, 'trip')).sort());
		assert.equal(calendar.length, 2);
		assert.equal(dates.length, 6);
		assert.equal(shapes.length, 4);
		assert.equal(stopTimes.length, 4);
		for (const planId of planIds) {
			const trip = trips.find(row => row.trip_id === namespaced(planId, 'trip'));
			assert.equal(trip?.service_id, namespaced(planId, 'service'));
			assert.equal(trip?.shape_id, namespaced(planId, 'shape'));
			assert.equal(trip?.route_id, '1009');
			assert.ok(calendar.some(row => row.service_id === trip?.service_id));
			assert.equal(dates.filter(row => row.service_id === trip?.service_id).length, 3);
			assert.equal(shapes.filter(row => row.shape_id === trip?.shape_id).length, 2);
			assert.deepEqual(stopTimes.filter(row => row.trip_id === trip?.trip_id).map(row => row.stop_id), ['A', 'B']);
		}
		assert.equal((await readRows(outputDirectory, 'agency.txt')).length, 1);
		assert.equal((await readRows(outputDirectory, 'routes.txt')).length, 1);
		assert.equal((await readRows(outputDirectory, 'routes_stepp.txt')).length, 1);
		assert.equal((await readRows(outputDirectory, 'stops.txt')).length, 2);
	});
});

for (const conflict of [
	{ fileName: 'agency.txt', from: 'Operator', to: 'Different operator' },
	{ fileName: 'routes.txt', from: 'Source route description', to: 'Different route' },
	{ fileName: 'stops.txt', from: 'Terminal B', to: 'Different stop' },
]) {
	test(`rejects conflicting ${conflict.fileName} metadata across merged plans`, async () => {
		await withExport(async (options, _outputDirectory, directory) => {
			const conflicting = makeFeed();
			conflicting[conflict.fileName] = conflicting[conflict.fileName].replace(conflict.from, conflict.to);
			const otherSource = path.join(directory, 'conflicting-source');
			await writeFeed(otherSource, conflicting);
			await exportPlanGtfs({ ...options, namespaceIds: true, planId: 'first' });
			await assert.rejects(exportPlanGtfs({ ...options, namespaceIds: true, planId: 'second', sourceDirectory: otherSource }), /conflict/i);
		});
	});
}

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
