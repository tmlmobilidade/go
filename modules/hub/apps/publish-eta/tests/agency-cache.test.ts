import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, it, mock } from 'node:test';

const values = new Map<string, string>();
const writes: { key: string, ttl: number }[] = [];
const queries: { path: string, agencyId: string }[] = [];
const eta = { trip_id: 'trip', stop_id: 'shared-stop', stop_sequence: 1, stop_name: 'Stop', vehicle_id: 'vehicle', eta_at: 1700000000000, eta_seconds: 30 };

mock.module('@tmlmobilidade/go-interfaces-cachedb', { namedExports: { cacheDb: {
	scan: async (pattern: string) => [...values.keys()].filter(key => key.startsWith(pattern.slice(0, -1))),
	deleteMany: async (keys: string[]) => { keys.forEach(key => values.delete(key)); },
	get: async (key: string) => values.get(key) ?? null,
	getNew: async (key: string) => values.has(key) ? JSON.parse(values.get(key)!) : undefined,
	set: async (key: string, value: string, ttl: number) => { values.set(key, value); writes.push({ key, ttl }); },
} } });
mock.module('@tmlmobilidade/go-interfaces-labdb', { namedExports: { labDb: {
	insert: async () => {},
	queryFromFile: async (path: string, params: { agency_id: string }) => {
		assert.ok(params.agency_id);
		queries.push({ path, agencyId: params.agency_id });
		const row = { ...eta, vehicle_id: params.agency_id };
		if (path.endsWith('select-eta-gtfs.sql')) return [{ trip_update: JSON.stringify({ trip: { trip_id: 'trip' }, vehicle: { id: params.agency_id } }) }];
		if (path.endsWith('select-eta.sql')) return [row];
		return [{ key: path.endsWith('select-eta-by-stop.sql') ? eta.stop_id : eta.trip_id, value: JSON.stringify([row]) }];
	},
} } });
after(() => mock.restoreAll());

it('publishes simplified and GTFS ETA data exclusively under each agency, including shared stop/trip IDs', async () => {
	const { publishEtas } = await import('../src/tasks/simplified/publish-etas.js');
	const { publishTripUpdates } = await import('../src/tasks/gtfs/publish-trip-updates.js');
	for (const agencyId of ['a', 'b']) {
		await publishEtas(agencyId);
		await publishTripUpdates(agencyId);
		assert.deepEqual(JSON.parse(values.get(`hub:v1:${agencyId}:realtime:eta:all`)!), [{ ...eta, vehicle_id: agencyId }]);
		assert.equal(JSON.parse(values.get(`hub:v1:${agencyId}:realtime:eta:by-stop:shared-stop`)!)[0].vehicle_id, agencyId);
		assert.equal(JSON.parse(values.get(`hub:v1:${agencyId}:realtime:eta:by-trip:trip`)!)[0].vehicle_id, agencyId);
		assert.equal(JSON.parse(values.get(`hub:v1:${agencyId}:realtime:eta:all:gtfs`)!).entity[0].trip_update.vehicle.id, agencyId);
	}
	assert.equal(writes.length, 8);
	assert.ok(writes.every(write => /^hub:v1:[ab]:realtime:eta:/.test(write.key) && write.ttl === 60));
	assert.deepEqual(queries.map(query => query.agencyId), ['a', 'a', 'b', 'b']);
	for (const query of queries) {
		const sql = await readFile(query.path, 'utf8');
		assert.match(sql, /(?:e\.)?agency_id = \{agency_id:String\}/);
		assert.doesNotMatch(sql, /\{agency_id:String\} = ''/);
	}
});

it('merges external ETA rows into only the requested agency caches', async () => {
	const { cacheEtasByAll } = await import('../src/tasks/simplified/cache-etas-by-all.js');
	const { cacheEtasByStop } = await import('../src/tasks/simplified/cache-etas-by-stop.js');
	const { cacheEtasByTrip } = await import('../src/tasks/simplified/cache-etas-by-trip.js');
	const before = new Map([...values].filter(([key]) => key.startsWith('hub:v1:b:')));
	const updated = { ...eta, vehicle_id: 'external' };
	await cacheEtasByAll([updated], 'a');
	await cacheEtasByStop([updated], 'a');
	await cacheEtasByTrip([updated], 'a');
	for (const suffix of ['all', 'by-stop:shared-stop', 'by-trip:trip']) {
		assert.deepEqual(JSON.parse(values.get(`hub:v1:a:realtime:eta:${suffix}`)!), [updated]);
	}
	assert.deepEqual(new Map([...values].filter(([key]) => key.startsWith('hub:v1:b:'))), before);
});

it('loads external-feed schedules from the agency network without a global fallback', async () => {
	const { loadTripScheduleIndex } = await import('../src/tasks/simplified/trip-schedule-index.js');
	values.set('hub:v1:network:lines', JSON.stringify([{ agency_id: 'missing', pattern_ids: ['global-pattern'] }]));
	assert.equal((await loadTripScheduleIndex('missing')).size, 0);
	values.set('hub:v1:a:network:lines', JSON.stringify([{ agency_id: 'a', pattern_ids: ['pattern'] }]));
	values.set('hub:v1:a:network:patterns:pattern', JSON.stringify({ data: [{ trips: [{ trip_ids: ['trip'], valid_on: ['20261102'], schedule: [{ stop_id: 'stop', stop_sequence: 1, arrival_time: '12:00:00' }] }] }], timestamp: 1700000000000 }));
	const index = await loadTripScheduleIndex('a');
	assert.equal(index.get('trip')?.[0].stops.get(1)?.stop_id, 'stop');
});
