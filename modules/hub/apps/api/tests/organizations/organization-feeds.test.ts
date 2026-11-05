import { FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { MongoDatabaseClient } from '@tmlmobilidade/go-clients-mongo';
import { OCIStorageClient } from '@tmlmobilidade/go-clients-oci-storage';
import { RedisDatabaseClient } from '@tmlmobilidade/go-clients-redis';
import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { createRssFeed } from '@tmlmobilidade/rss';
import assert from 'node:assert/strict';
import { after, before, it, mock } from 'node:test';

const cache = new Map<string, string>();
const reads: string[] = [];
const organizations = [
	{ _id: 'org', agency_ids: ['a', 'b', 'a'], long_name: 'Test Organization', open_data: { enabled: true }, short_name: 'Test' },
	{ _id: 'other', agency_ids: ['c'], long_name: 'Other Organization', open_data: { enabled: true }, short_name: 'Other' },
	{ _id: 'disabled', agency_ids: ['a'], long_name: 'Disabled Organization', open_data: { enabled: false }, short_name: 'Off' },
];

// Replace only database transports; the real routes, hooks, handlers and response helpers run.
mock.method(MongoDatabaseClient, 'getClient', async () => ({
	db: () => ({ collection: (name: string) => ({
		findOne: async (filter: Record<string, unknown>) => {
			if (name === 'attachments') {
				const id = (filter._id as { $eq: string }).$eq;
				return id === 'gtfs-latest-org' ? { _id: id, resource_id: id, scope: 'hub', name: 'gtfs.zip' } : null;
			}
			return organizations.find(org => org._id === filter._id && org.open_data.enabled === filter['open_data.enabled']) ?? null;
		},
		find: () => ({ toArray: async () => organizations.filter(org => org.open_data.enabled) }),
	}) }),
}));
mock.method(RedisDatabaseClient, 'getClient', async () => ({
	get: async (key: string) => { reads.push(key); return cache.get(key) ?? null; },
}));

mock.method(OCIStorageClient, 'getClient', async () => ({ getFileUrl: async (key: string) => `https://storage.example/${key}` }));

const server = FastifyService.getInstance({ logger: false }).server;
before(async () => {
	await import('../../src/endpoints/v1/index.js');
	await server.ready();
});
after(async () => { await server.close(); mock.restoreAll(); });

it('lists enabled organizations and rejects disabled or unknown IDs before reading feeds', async () => {
	const directory = await server.inject('/v1/organizations');
	assert.equal(directory.statusCode, 200);
	assert.deepEqual(directory.json().data.map((org: { _id: string }) => org._id), ['org', 'other']);
	reads.length = 0;
	for (const id of ['disabled', 'missing']) {
		const response = await server.inject(`/v1/${id}/network/lines`);
		assert.equal(response.statusCode, 404);
	}
	assert.deepEqual(reads, []);
});

it('merges only member agencies, deduplicates agency IDs, and tolerates missing caches', async () => {
	cache.clear(); reads.length = 0;
	cache.set('hub:v1:a:network:lines', JSON.stringify([{ _id: 'a-line' }]));
	cache.set('hub:v1:c:network:lines', JSON.stringify([{ _id: 'private-line' }]));
	cache.set('hub:v1:network:lines', JSON.stringify([{ _id: 'global-line' }]));
	let response = await server.inject('/v1/org/network/lines');
	assert.deepEqual(response.json().data, [{ _id: 'a-line' }]);
	assert.deepEqual(reads.sort(), ['hub:v1:a:network:lines', 'hub:v1:b:network:lines']);
	cache.set('hub:v1:b:network:lines', JSON.stringify([{ _id: 'b-line' }]));
	response = await server.inject('/v1/org/network/lines');
	assert.deepEqual(response.json().data.map((line: { _id: string }) => line._id), ['a-line', 'b-line']);
	assert.equal((await server.inject('/v1/org/network/lines/private-line')).statusCode, 404);
});

it('unions shared-stop references for list and detail responses without modifying source records', async () => {
	cache.clear();
	for (const agencyId of ['a', 'b']) {
		const stop = { _id: 'shared', agency_ids: [agencyId], line_ids: [`${agencyId}-line`], route_ids: [], pattern_ids: [], legacy_ids: [agencyId], flags: [{ agency_id: agencyId, stop_id: 'old' }] };
		cache.set(`hub:v1:${agencyId}:network:stops`, JSON.stringify([stop]));
		cache.set(`hub:v1:${agencyId}:network:stops:shared`, JSON.stringify({ data: stop, timestamp: 1700000000000 }));
	}
	const list = (await server.inject('/v1/org/network/stops')).json().data;
	const detail = (await server.inject('/v1/org/network/stops/shared')).json().data;
	assert.deepEqual(list, [detail]);
	assert.deepEqual(detail.agency_ids, ['a', 'b']);
	assert.deepEqual(detail.line_ids, ['a-line', 'b-line']);
	assert.equal(detail.flags.length, 2);
});

it('filters global agency and approved-plan publications to organization membership', async () => {
	cache.clear();
	cache.set('hub:v1:agencies:json', JSON.stringify({ data: ['a', 'b', 'c'].map(_id => ({ _id })), timestamp: 1700000000000 }));
	cache.set('hub:v1:plans:approved:json', JSON.stringify(['a', 'b', 'c'].map(agency_id => ({ agency_id }))));
	assert.deepEqual((await server.inject('/v1/org/agencies')).json().data, [{ _id: 'a' }, { _id: 'b' }]);
	assert.deepEqual((await server.inject('/v1/org/plans')).json().data, [{ agency_id: 'a' }, { agency_id: 'b' }]);
});

it('reads publisher wrappers and the requested stop/trip ETA keys', async () => {
	cache.clear();
	cache.set('hub:v1:a:realtime:vehicles:positions:json', JSON.stringify({ data: [{ _id: 'vehicle' }], timestamp: 1700000000000 }));
	cache.set('hub:v1:b:realtime:vehicles:metadata:json', JSON.stringify([{ _id: 'metadata' }]));
	cache.set('hub:v1:a:realtime:eta:by-stop:stop', JSON.stringify([{ trip_id: 'a-trip' }]));
	cache.set('hub:v1:b:realtime:eta:by-stop:stop', JSON.stringify([{ trip_id: 'b-trip' }]));
	cache.set('hub:v1:b:realtime:eta:by-trip:trip', JSON.stringify([{ stop_id: 'b-stop' }]));
	const positions = await server.inject('/v1/org/vehicles/positions');
	assert.deepEqual(positions.json().data, [{ _id: 'vehicle' }]);
	assert.equal(positions.json().generated_at, 1700000000000);
	assert.deepEqual((await server.inject('/v1/org/vehicles/metadata')).json().data, [{ _id: 'metadata' }]);
	assert.deepEqual((await server.inject('/v1/org/eta/by-stop/stop')).json().data, [{ trip_id: 'a-trip' }, { trip_id: 'b-trip' }]);
	assert.deepEqual((await server.inject('/v1/org/eta/by-trip/trip')).json().data, [{ stop_id: 'b-stop' }]);
	assert.deepEqual((await server.inject('/v1/org/eta')).json().data, []);
});

it('merges GTFS feeds with unique entity IDs and encodes the same feed as Protobuf', async () => {
	cache.clear();
	for (const [path, suffix] of [['alerts', 'alerts:published:gtfs'], ['eta', 'realtime:eta:all:gtfs'], ['vehicles/positions', 'realtime:vehicles:positions:gtfs']]) {
		for (const agencyId of ['a', 'b']) cache.set(`hub:v1:${agencyId}:${suffix}`, JSON.stringify({ entity: [{ id: 'duplicate' }], header: { gtfs_realtime_version: '2.0', incrementality: 'FULL_DATASET', timestamp: agencyId === 'a' ? 1700000000 : 1700000010 } }));
		const json = (await server.inject(`/v1/org/${path}/gtfs`)).json().data;
		assert.deepEqual(json.entity.map((entity: { id: string }) => entity.id), ['a:duplicate', 'b:duplicate']);
		const pb = await server.inject(`/v1/org/${path}/gtfs.pb`);
		assert.equal(pb.statusCode, 200);
		assert.match(pb.headers['content-type'] ?? '', /octet-stream/);
		const decoded = await decodeGtfsRtFeed(pb.rawPayload);
		assert.deepEqual(decoded.entity.map(entity => entity.id), ['a:duplicate', 'b:duplicate']);
	}
	cache.clear();
	cache.set('hub:v1:b:realtime:eta:all:gtfs', JSON.stringify({ entity: [{ id: 'only-b' }], header: { gtfs_realtime_version: '2.0', incrementality: 'FULL_DATASET', timestamp: 1700000000 } }));
	assert.equal((await server.inject('/v1/org/eta/gtfs')).json().data.entity[0].id, 'b:only-b');
});

it('merges generated RSS items into one organization channel and preserves escaped text', async () => {
	cache.clear();
	for (const agencyId of ['a', 'b']) cache.set(`hub:v1:${agencyId}:alerts:published:rss`, createRssFeed([{ title: agencyId, description: '</item> & text', link: `https://example.com/${agencyId}` }], { title: agencyId, description: agencyId, link: 'https://example.com', copyright: agencyId }));
	const response = await server.inject('/v1/org/alerts.rss');
	assert.equal(response.statusCode, 200);
	assert.match(response.headers['content-type'] ?? '', /rss\+xml/);
	assert.equal((response.body.match(/<channel>/g) ?? []).length, 1);
	assert.equal((response.body.match(/<item>/g) ?? []).length, 2);
	assert.match(response.body, /Test - Alertas/);
	assert.match(response.body, /&lt;\/item&gt; &amp; text/);
});

it('serves shape geometry from published patterns and keeps unrelated organizations isolated', async () => {
	cache.clear();
	cache.set('hub:v1:a:network:lines', JSON.stringify([{ pattern_ids: ['pattern'] }]));
	cache.set('hub:v1:a:network:patterns:pattern', JSON.stringify({ data: [{ _id: 'pattern', agency_id: 'a', shape_id: 'shape', shape_polyline: 'encoded', shape_extension: 100 }], timestamp: 1700000000000 }));
	const response = await server.inject('/v1/org/network/shapes/shape');
	assert.deepEqual(response.json().data, { _id: 'shape', agency_id: 'a', encoded_polyline: 'encoded', extension: 100 });
	assert.equal((await server.inject('/v1/other/network/shapes/shape')).statusCode, 404);
	assert.equal((await server.inject('/v1/org/network/patterns/pattern')).json().data[0]._id, 'pattern');
});


it('streams the organization-specific GTFS archive and reports missing exports', async () => {
	const fetched: string[] = [];
	mock.method(globalThis, 'fetch', async (url: string) => {
		fetched.push(url);
		return new Response('zip-bytes', { headers: { 'content-length': '9' } });
	});
	const response = await server.inject('/v1/org/plans/gtfs');
	assert.equal(response.statusCode, 200);
	assert.equal(response.body, 'zip-bytes');
	assert.match(response.headers['content-disposition'] ?? '', /gtfs-latest-org.zip/);
	assert.deepEqual(fetched, ['https://storage.example/hub/gtfs-latest-org/gtfs-latest-org.zip']);
	assert.equal((await server.inject('/v1/other/plans/gtfs')).statusCode, 404);
});

it('replaces obsolete global and realtime routes while retaining the global debug endpoint', async () => {
	for (const path of ['/v1/network/lines', '/v1/alerts', '/v1/realtime/eta', '/v1/plans/gtfs/cm']) {
		assert.equal((await server.inject(path)).statusCode, 404);
	}
	assert.equal((await server.inject('/v1/debug/time')).statusCode, 200);
});
