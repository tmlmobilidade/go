/* * */

import { type Location } from '@tmlmobilidade/go-types-locations';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { importStopsTask } from './tasks/import-stops.js';
import { parseImportOptions } from './utils/cli.js';
import { parseStops, toStop } from './utils/stops.js';

/* * */

const division = { admin_level: 'test', code: null, name: 'Test', osm_id: 1 };
const location: Location = { country: division, primary: division, secondary: division, tertiary: division };
const csv = 'stop_id,stop_name,stop_lat,stop_lon\n001,VILARINHO SECO,41.682681,-7.812729\n002,ALTURAS BARROSO,41.705269,-7.822898\n';

/* * */

/**
 * Runs a task check with a temporary GTFS file and no database connections.
 */
async function withFile(check: (file: string) => Promise<void>, text = csv) {
	//

	const directory = await mkdtemp(join(tmpdir(), 'import-gtfs-stops-'));
	try {
		const file = join(directory, 'stops.txt');
		await writeFile(file, text);
		await check(file);
	} finally {
		await rm(directory, { force: true, recursive: true });
	}
}

/* * */

test('CLI defaults start ID and rejects invalid overrides', () => {
	//

	assert.deepEqual(parseImportOptions(['--file', 'stops.txt', '--agency-id', '51']), { agencyId: '51', dryRun: false, file: 'stops.txt', startId: 100000 });
	assert.equal(parseImportOptions(['--file', 'stops.txt', '--agency-id', '51', '--start-id', '700000'])?.startId, 700000);
	assert.throws(() => parseImportOptions(['--file', 'stops.txt', '--agency-id', '51', '--start-id', '99999']));
	assert.throws(() => parseImportOptions(['--file', 'stops.txt']));
});

test('parser supports quoting, BOM and platforms; mapping preserves IDs and generates speech', () => {
	//

	const rows = parseStops('\uFEFFstop_id,stop_name,stop_desc,stop_lat,stop_lon,location_type\r\n001,"BEÇA, ""CRUZ""","First\nSecond",41.682468,-7.698835,\r\nstation,Station,,,,1\r\n');
	assert.equal(rows.length, 1);
	const stop = toStop(rows[0], '700000', location, '51');
	assert.equal(stop.legacy_id, '51:001');
	assert.equal(stop.flags[0].stop_id, '001');
	assert.equal(stop.observations, 'First\nSecond');
	assert.equal(stop.lifecycle_status, 'draft');
	assert.ok(stop.tts_name);
	assert.throws(() => parseStops(`${csv}001,Duplicate,41,-7`));
});

test('matching agency and GTFS ID use the same flag and skip before location resolution', async () => {
	//

	await withFile(async (file) => {
		const rows = parseStops(csv);
		const existing = toStop(rows[0], '700000', location, '51');
		let locations = 0;
		const result = await importStopsTask({ agencyId: '51', dryRun: true, file, startId: 100000 }, {
			findAgency: async () => true,
			findLocation: async () => {
				locations++;
				return location;
			},
			stops: {
				exists: async () => false,
				findOne: async (filter) => {
					assert.deepEqual(filter.$or?.[0], { flags: { $elemMatch: { agency_ids: '51', stop_id: '001' } } });
					return existing;
				},
				insertOneUnsafe: async () => { throw new Error('Must not insert an existing stop'); },
			},
		});
		assert.deepEqual(result, { inserted: 0, prepared: 0, previewed: 0, skipped: 1 });
		assert.equal(locations, 0);
	}, csv.split('\n').slice(0, 2).join('\n'));
});

test('dry run prepares new stops without writes', async () => {
	//

	await withFile(async (file) => {
		const result = await importStopsTask({ agencyId: '51', dryRun: true, file, startId: 100000 }, {
			findAgency: async () => true,
			findLocation: async () => location,
			stops: {
				exists: async () => false,
				findOne: async () => null,
				insertOneUnsafe: async () => { throw new Error('Dry run must not insert'); },
			},
		});
		assert.deepEqual(result, { inserted: 0, prepared: 2, previewed: 2, skipped: 0 });
	});
});

test('prepares all locations before writes, skips occupied GO IDs and rechecks duplicates', async () => {
	//

	await withFile(async (file) => {
		let locations = 0;
		let lookups = 0;
		const inserted: string[] = [];
		const result = await importStopsTask({ agencyId: '51', dryRun: false, file, startId: 100000 }, {
			findAgency: async () => true,
			findLocation: async () => {
				locations++;
				return location;
			},
			stops: {
				exists: async (key, value) => key === '_id' && value === '100000',
				findOne: async () => {
					lookups++;
					return lookups === 4 ? toStop(parseStops(csv)[1], '800000', location, '51') : null;
				},
				insertOneUnsafe: async (stop) => {
					assert.equal(locations, 2);
					inserted.push(stop._id);
					return stop;
				},
			},
		});
		assert.deepEqual(inserted, ['100001']);
		assert.deepEqual(result, { inserted: 1, prepared: 2, previewed: 0, skipped: 1 });
	});
});

test('location failure includes the GTFS ID and leaves no partial inserts', async () => {
	//

	await withFile(async (file) => {
		let locations = 0;
		let inserted = 0;
		await assert.rejects(importStopsTask({ agencyId: '51', dryRun: false, file, startId: 100000 }, {
			findAgency: async () => true,
			findLocation: async () => {
				if (++locations === 2) throw new Error('Location not found');
				return location;
			},
			stops: {
				exists: async () => false,
				findOne: async () => null,
				insertOneUnsafe: async (stop) => {
					inserted++;
					return stop;
				},
			},
		}), /GTFS 002.*Location not found/);
		assert.equal(inserted, 0);
	});
});
