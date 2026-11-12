/* * */

import { type Location } from '@tmlmobilidade/go-types-locations';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { setImmediate } from 'node:timers/promises';

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

	assert.deepEqual(parseImportOptions(['--file', 'stops.txt', '--agency-id', '51']), { agencyIds: ['51'], dryRun: false, file: 'stops.txt', startId: 100000 });
	assert.deepEqual(parseImportOptions(['--file', 'stops.txt', '--agency-id', ' KJTOU ', '--agency-id', '1H6XC', '--agency-id', 'KJTOU'])?.agencyIds, ['KJTOU', '1H6XC']);
	assert.equal(parseImportOptions(['--file', 'stops.txt', '--agency-id', '51', '--start-id', '700000'])?.startId, 700000);
	assert.equal(parseImportOptions(['--file', 'stops.txt', '--agency-id', '51', '--export-json', 'stops.json'])?.exportJson, 'stops.json');
	assert.throws(() => parseImportOptions(['--file', 'stops.txt', '--agency-id', '51', '--export-json', '']));
	assert.throws(() => parseImportOptions(['--file', 'stops.txt', '--agency-id', '51', '--start-id', '99999']));
	assert.throws(() => parseImportOptions(['--file', 'stops.txt']));
});

test('parser supports quoting, BOM and platforms; mapping preserves IDs and generates speech', () => {
	//

	const rows = parseStops('\uFEFFstop_id,stop_name,stop_desc,stop_lat,stop_lon,location_type\r\n001,"BEÇA, ""CRUZ""","First\nSecond",41.682468,-7.698835,\r\nstation,Station,,,,1\r\n');
	assert.equal(rows.length, 1);
	const stop = toStop(rows[0], '700000', location, ['51']);
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
		const existing = toStop(rows[0], '700000', location, ['51']);
		let locations = 0;
		const result = await importStopsTask({ agencyIds: ['51'], dryRun: true, file, startId: 100000 }, {
			findAgency: async () => true,
			findLocation: async () => {
				locations++;
				return location;
			},
			stops: {
				findMany: async () => [],
				findOne: async (filter) => {
					assert.deepEqual(filter.$or?.[0], { flags: { $elemMatch: { agency_ids: { $in: ['51'] }, stop_id: '001' } } });
					return existing;
				},
				insertOneUnsafe: async () => { throw new Error('Must not insert an existing stop'); },
			},
		});
		assert.deepEqual(result, { exported: 0, inserted: 0, prepared: 0, previewed: 0, skipped: 1 });
		assert.equal(locations, 0);
	}, csv.split('\n').slice(0, 2).join('\n'));
});

test('dry run resolves locations concurrently without writes', async () => {
	//

	const extraRows = Array.from({ length: 10 }, (_, index) => `stop-${index},Extra stop,41,-7\n`).join('');
	await withFile(async (file) => {
		let active = 0;
		let peak = 0;
		const result = await importStopsTask({ agencyIds: ['51'], dryRun: true, file, startId: 100000 }, {
			findAgency: async () => true,
			findLocation: async () => {
				peak = Math.max(peak, ++active);
				await setImmediate();
				active--;
				return location;
			},
			stops: {
				findMany: async () => [],
				findOne: async () => null,
				insertOneUnsafe: async () => { throw new Error('Dry run must not insert'); },
			},
		});
		assert.deepEqual(result, { exported: 0, inserted: 0, prepared: 12, previewed: 12, skipped: 0 });
		assert.equal(peak, 10);
	}, csv + extraRows);
});

test('JSON export writes new documents without inserting them', async () => {
	//

	await withFile(async (file) => {
		const agencyIds = ['KJTOU', '1H6XC'];
		const exportJson = `${file}.json`;
		const [existingRow, newRow] = parseStops(csv);
		const existing = toStop(existingRow, '700000', location, agencyIds);
		const result = await importStopsTask({ agencyIds, dryRun: false, exportJson, file, startId: 100000 }, {
			findAgency: async () => true,
			findLocation: async () => location,
			stops: {
				findMany: async () => [toStop(parseStops(csv)[0], '100000', location, ['51'])],
				findOne: async (filter) => {
					const flags = filter.$or?.[0]?.flags;
					return flags && '$elemMatch' in flags && flags.$elemMatch?.stop_id === existingRow.stop_id ? existing : null;
				},
				insertOneUnsafe: async () => { throw new Error('JSON export must not insert'); },
			},
		});
		const documents = JSON.parse(await readFile(exportJson, 'utf8'));
		const expected = toStop(newRow, '100001', location, agencyIds);
		assert.deepEqual(documents, [{ ...expected, created_at: documents[0].created_at, updated_at: documents[0].updated_at }]);
		assert.equal(typeof documents[0].created_at, 'number');
		assert.equal(typeof documents[0].updated_at, 'number');
		assert.deepEqual(result, { exported: 1, inserted: 0, prepared: 1, previewed: 0, skipped: 1 });
	});
});

test('checks raw and agency-prefixed legacy IDs and assigns all agencies to new stops', async () => {
	//

	const agencyIds = ['KJTOU', '1H6XC', 'OP1VZ', 'VZAS3', '8NDX4', '0AMEO'];
	const text = csv.replace('001,', 'prg:aro:1,').replace('002,', 'prg:aro:10,');
	const [existingRow, newRow] = parseStops(text);
	const existing = { ...toStop(existingRow, '700000', location, ['0AMEO']), legacy_ids: [existingRow.stop_id] };
	const checkedAgencies: string[] = [];
	let lookups = 0;

	await withFile(async (file) => {
		const result = await importStopsTask({ agencyIds, dryRun: false, file, startId: 100000 }, {
			findAgency: async (agencyId) => {
				checkedAgencies.push(agencyId);
				return true;
			},
			findLocation: async () => location,
			stops: {
				findMany: async () => [],
				findOne: async (filter) => {
					const { stop_id: stopId } = lookups++ === 0 ? existingRow : newRow;
					const legacyIds = [stopId, ...agencyIds.map(agencyId => `${agencyId}:${stopId}`)];
					assert.deepEqual(filter.$or, [
						{ flags: { $elemMatch: { agency_ids: { $in: agencyIds }, stop_id: stopId } } },
						{ legacy_id: { $in: legacyIds } },
						{ legacy_ids: { $in: legacyIds } },
					]);
					return stopId === existingRow.stop_id ? existing : null;
				},
				insertOneUnsafe: async (stop) => {
					assert.equal(stop.flags.length, 1);
					assert.deepEqual(stop.flags[0].agency_ids, agencyIds);
					assert.equal(stop.flags[0].stop_id, newRow.stop_id);
					assert.deepEqual(stop.legacy_ids, agencyIds.map(agencyId => `${agencyId}:${newRow.stop_id}`));
					assert.equal(stop.legacy_id, stop.legacy_ids[0]);
					return stop;
				},
			},
		});
		assert.deepEqual(result, { exported: 0, inserted: 1, prepared: 1, previewed: 0, skipped: 1 });
		assert.deepEqual(checkedAgencies, agencyIds);
		assert.equal(lookups, 3);
	}, text);
});

test('prepares all locations before writes, skips occupied GO IDs and rechecks duplicates', async () => {
	//

	await withFile(async (file) => {
		let locations = 0;
		let lookups = 0;
		let idLookups = 0;
		const inserted: string[] = [];
		const [firstRow, secondRow] = parseStops(csv);
		const result = await importStopsTask({ agencyIds: ['51'], dryRun: false, file, startId: 100000 }, {
			findAgency: async () => true,
			findLocation: async () => {
				locations++;
				return location;
			},
			stops: {
				findMany: async (filter) => {
					idLookups++;
					const ids = Array.from({ length: 100 }, (_, index) => String(100000 + index));
					assert.deepEqual(filter, { $or: [{ _id: { $in: ids } }, { legacy_id: { $in: ids } }] });
					return [{ ...toStop(firstRow, '100000', location, ['51']), legacy_id: '100001' }];
				},
				findOne: async () => {
					lookups++;
					return lookups === 4 ? toStop(secondRow, '800000', location, ['51']) : null;
				},
				insertOneUnsafe: async (stop) => {
					assert.equal(locations, 2);
					inserted.push(stop._id);
					return stop;
				},
			},
		});
		assert.deepEqual(inserted, ['100002']);
		assert.equal(idLookups, 1);
		assert.deepEqual(result, { exported: 0, inserted: 1, prepared: 2, previewed: 0, skipped: 1 });
	});
});

test('location failure includes the GTFS ID and leaves no partial inserts', async () => {
	//

	await withFile(async (file) => {
		let locations = 0;
		let inserted = 0;
		await assert.rejects(importStopsTask({ agencyIds: ['51'], dryRun: false, file, startId: 100000 }, {
			findAgency: async () => true,
			findLocation: async () => {
				if (++locations === 2) throw new Error('Location not found');
				return location;
			},
			stops: {
				findMany: async () => [],
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
