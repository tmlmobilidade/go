import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { PatternSchema } from '@tmlmobilidade/go-types-offer';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import { beforeEach, mock, test } from 'node:test';

/* * */

type Row = Record<string, unknown> & { _id: string };
type Handler = (request: FastifyRequest<{ Body: unknown, Params: { id: string, stopId: string }, Querystring: unknown }>, reply: FastifyReply<unknown>) => Promise<unknown>;
let LINES: Row[];
let ROUTES: Row[];
let PATTERNS: Row[];
let STOPS: Row[];
let WRITES: { data?: Record<string, unknown>, id?: string, operation: string }[];
let QUERIES: { collection: string, filter: unknown }[];
const audit = { created_at: 1_792_368_000_000, created_by: 'creator', updated_at: 1_792_368_000_000 };
const body = { code: 'P1', destination: 'End', headsign: 'Headsign', line_id: 'line', origin: 'Start', route_id: 'route' };
const gtfs = {
	path: [{ avg_speed: 25, dwell_time: 12, shape_dist_traveled: 0, stop_id: '100001', stop_sequence: 1 }],
	shape: [{ shape_dist_traveled: 100, shape_pt_lat: 38.1, shape_pt_lon: -9.1, shape_pt_sequence: 2 }, { shape_dist_traveled: 0, shape_pt_lat: 38, shape_pt_lon: -9, shape_pt_sequence: 1 }],
};

function matches(row: Row, filter: Record<string, unknown> = {}) {
	return Object.entries(filter).every(([key, value]) => {
		const stored = key.split('.').reduce<unknown>((entry, field) => entry && typeof entry === 'object' ? (entry as Record<string, unknown>)[field] : undefined, row);
		if (value && typeof value === 'object' && '$in' in value) return (value.$in as unknown[]).includes(stored);
		if (value && typeof value === 'object' && '$exists' in value) return (stored !== undefined) === value.$exists;
		return stored === value;
	});
}

mock.module('@tmlmobilidade/go-interfaces-godb', { namedExports: { goDb: {
	infrastructure: { stops: {
		findById: async (id: string) => STOPS.find(stop => stop._id === id) ?? null,
		findMany: async (filter: Record<string, unknown>) => STOPS.filter(stop => matches(stop, filter)),
		findOne: async () => null,
	} },
	offer: {
		events: { findMany: async () => [] },
		lines: {
			findById: async (id: string) => LINES.find(line => line._id === id) ?? null,
			findMany: async (filter: Record<string, unknown>) => {
				QUERIES.push({ collection: 'lines', filter });
				return LINES.filter(line => matches(line, filter));
			},
		},
		patterns: {
			deleteById: async (id: string) => { WRITES.push({ id, operation: 'delete' }); },
			findById: async (id: string) => PATTERNS.find(pattern => pattern._id === id) ?? null,
			findMany: async (filter: Record<string, unknown>) => {
				QUERIES.push({ collection: 'patterns', filter });
				return PATTERNS.filter(pattern => matches(pattern, filter));
			},
			insertOne: async (data: Record<string, unknown>) => {
				WRITES.push({ data, operation: 'insert' });
				return PatternSchema.parse({ ...data, ...audit, _id: 'new', created_by: data.created_by });
			},
			updateOne: async ({ _id }: { _id: string }, data: Record<string, unknown>) => {
				WRITES.push({ data, id: _id, operation: 'is_locked' in data ? 'lock' : 'update' });
				const index = PATTERNS.findIndex(pattern => pattern._id === _id);
				PATTERNS[index] = PatternSchema.parse({ ...PATTERNS[index], ...data });
				return PATTERNS[index];
			},
		},
		routes: { findById: async (id: string) => ROUTES.find(route => route._id === id) ?? null },
		typologies: { findMany: async () => [] },
	},
} } });

const handlers: Record<string, Handler> = {};
for (const [action, file] of Object.entries({ comment: 'comment-pattern', create: 'create-pattern', delete: 'delete-pattern', get: 'get-pattern', import: 'import-pattern-gtfs', lock: 'lock-pattern', shapes: 'list-pattern-shapes', update: 'update-pattern' })) {
	const exports = await import(`../src/endpoints/patterns/handlers/${file}.js`);
	handlers[action] = Object.values(exports)[0] as Handler;
}

beforeEach(() => {
	LINES = [{ _id: 'line', agency_id: 'A', code: 'L1', is_locked: false, name: 'Line', typology: null }, { _id: 'other', agency_id: 'B', is_locked: false }];
	ROUTES = [{ _id: 'route', is_locked: false, line_id: 'line' }, { _id: 'other-route', is_locked: false, line_id: 'other' }];
	PATTERNS = [PatternSchema.parse({ ...audit, ...body, _id: 'pattern', parameters: [{ _id: 'default', kind: 'default', path: [] }], path: [], rules: [] })];
	STOPS = [{ _id: '100001', name: 'Stop' }];
	WRITES = [];
	QUERIES = [];
});

async function invoke(action: string, { agencies = ['A'], data = action === 'create' ? body : action === 'import' ? gtfs : action === 'comment' ? { message: 'Note' } : {}, id = 'pattern', permissions, query = {} }: { agencies?: string[], data?: unknown, id?: string, permissions?: Permission[], query?: unknown } = {}) {
	let status = 200;
	let payload: unknown;
	const reply = {
		header: () => reply,
		send: (value: unknown) => {
			payload = value;
			return reply;
		},
		status: (value: number) => {
			status = value;
			return reply;
		},
	};
	const verb = action === 'get' || action === 'shapes' ? 'read' : action === 'import' || action === 'comment' ? 'update' : action;
	const request = { body: data, me: { _id: 'actor', first_name: 'Test', last_name: 'User' }, params: { id }, permissions: permissions ?? [{ action: verb, resources: { agency_ids: agencies }, scope: 'lines' }], query };
	await handlers[action](request as Parameters<Handler>[0], reply as unknown as FastifyReply<unknown>);
	const response = payload as ApiResponse<Row>;
	assert.equal(response.status_code, String(status));
	assert.equal(typeof response.timestamp, 'number');
	assert.equal('statusCode' in response, false);
	return { response, status };
}

/* * */

for (const action of ['create', 'get', 'update', 'delete', 'lock', 'comment', 'import']) {
	test(`Pattern ${action} checks the parent operator before reads or writes`, async () => {
		assert.equal((await invoke(action, { agencies: ['B'] })).status, 403);
		assert.deepEqual(WRITES, []);
		assert.deepEqual(QUERIES, []);
	});
	if (action !== 'create') {
		test(`Pattern ${action} returns 404 for a missing record`, async () => {
			assert.equal((await invoke(action, { id: 'missing' })).status, 404);
			assert.deepEqual(WRITES, []);
		});
	}
	if (action !== 'get') {
		for (const parent of ['line', 'route', 'own']) {
			if ((action === 'create' && parent === 'own') || (action === 'lock' && parent === 'own')) continue;
			test(`Pattern ${action} respects ${parent} lock`, async () => {
				(parent === 'line' ? LINES[0] : parent === 'route' ? ROUTES[0] : PATTERNS[0]).is_locked = true;
				assert.equal((await invoke(action)).status, 409);
				assert.deepEqual(WRITES, []);
			});
		}
	}
}

test('Create strips spoofed identity, locks, history and parameters, and seeds one server default', async () => {
	assert.equal((await invoke('create', { data: { ...body, _id: 'spoof', comments: [{ message: 'Spoof' }], created_at: 1, created_by: 'spoof', is_locked: true, parameters: [{ _id: 'spoof' }], updated_by: 'spoof' } })).status, 200);
	const saved = WRITES[0].data;
	assert.equal(saved?.created_by, 'actor');
	assert.equal(saved?.updated_by, 'actor');
	assert.equal(saved?.is_locked, false);
	assert.deepEqual(saved?.comments, []);
	assert.equal(saved?._id, undefined);
	const parameters = saved?.parameters as Row[];
	assert.equal(parameters.length, 1);
	assert.equal(parameters[0].kind, 'default');
	assert.notEqual(parameters[0]._id, 'spoof');
});
test('Invalid create/update requests return 400 with no writes', async () => {
	assert.equal((await invoke('create', { data: { ...body, line_id: '' } })).status, 400);
	assert.equal((await invoke('update', { data: { code: 12 } })).status, 400);
	assert.deepEqual(WRITES, []);
});
test('Update preserves old history and creates server audit/activity without persisting enriched path stops', async () => {
	const note = { ...audit, message: 'Original', type: 'note' };
	PATTERNS[0].comments = [note];
	assert.equal((await invoke('update', { data: { comments: [], created_by: 'spoof', headsign: 'Changed', is_locked: true, path: [{ _id: 'path', stop: { _id: 'spoof' }, stop_id: '100001' }], updated_by: 'spoof' } })).status, 200);
	const saved = WRITES[0].data;
	assert.equal(saved?.updated_by, 'actor');
	assert.equal(saved?.created_by, undefined);
	assert.equal(saved?.is_locked, undefined);
	assert.equal((saved?.comments as Row[])[0].message, 'Original');
	assert.equal((saved?.comments as Row[])[1].type, 'field_changed');
	assert.equal((saved?.path as Row[])[0].stop, undefined);
});
test('Ordinary Pattern updates cannot move either parent', async () => {
	for (const data of [{ line_id: 'other' }, { route_id: 'other-route' }]) assert.equal((await invoke('update', { data })).status, 409);
	assert.deepEqual(WRITES, []);
});
test('Read permits locked hierarchy and populates missing stops without writing', async () => {
	LINES[0].is_locked = true;
	PATTERNS[0].is_locked = true;
	PATTERNS[0].path = [{ _id: 'one', stop_id: '100001' }, { _id: 'missing', stop_id: '100002' }];
	const result = await invoke('get');
	assert.equal(result.status, 200);
	const path = result.response.data?.path as Row[];
	assert.deepEqual(path[0].stop, STOPS[0]);
	assert.equal(path[1].stop, null);
	assert.deepEqual(WRITES, []);
});
test('Empty Pattern paths return an array in the detail DTO', async () => {
	delete PATTERNS[0].path;
	assert.deepEqual((await invoke('get')).response.data?.path, []);
});
test('Dedicated lock action can unlock own lock, uses actor ID and preserves history', async () => {
	PATTERNS[0].is_locked = true;
	assert.equal((await invoke('lock')).response.data?.is_locked, false);
	assert.deepEqual(WRITES[0].data, { is_locked: false, updated_by: 'actor' });
});
test('Comment accepts only message and generates authors, identity and timestamps on the server', async () => {
	assert.equal((await invoke('comment', { data: { _id: 'spoof', created_at: 1, created_by: 'spoof', message: '  Note  ', type: 'crud', updated_by: 'spoof' } })).status, 200);
	assert.equal(WRITES[0].data?.updated_by, 'actor');
	const note = (WRITES[0].data?.comments as Row[])[0];
	assert.equal(note.message, 'Note');
	assert.equal(note.type, 'note');
	assert.equal(note.created_by, 'Test User');
	assert.equal(note.updated_by, 'Test User');
	assert.notEqual(note._id, 'spoof');
	assert.ok(Number(note.created_at) > 1e10);
	assert.equal((await invoke('comment', { data: { message: ' ' } })).status, 400);
	assert.equal((await invoke('comment', { data: { message: 'x'.repeat(301) } })).status, 400);
});
test('Delete removes only the selected Pattern', async () => {
	assert.equal((await invoke('delete')).status, 200);
	assert.deepEqual(WRITES, [{ id: 'pattern', operation: 'delete' }]);
});
test('GTFS import remains a preview, sorts shape points and preserves path flags/settings', async () => {
	PATTERNS[0].path = [{ _id: 'kept-path', allow_drop_off: false, allow_pickup: false, stop_id: '100001', timepoint: false, zones: ['zone'] }];
	const result = await invoke('import');
	assert.equal(result.status, 200);
	const path = result.response.data?.path as Row[];
	assert.equal(path[0]._id, 'kept-path');
	assert.equal(path[0].allow_pickup, false);
	assert.equal(path[0].allow_drop_off, false);
	assert.equal(path[0].timepoint, false);
	assert.deepEqual(path[0].zones, ['zone']);
	assert.deepEqual(path[0].stop, STOPS[0]);
	const shape = result.response.data?.shape as { extension: number, geojson: { geometry: { coordinates: number[][] } } };
	assert.equal(shape.extension, 100);
	assert.deepEqual(shape.geojson.geometry.coordinates, [[-9, 38], [-9.1, 38.1]]);
	assert.deepEqual(WRITES, []);
});
test('GTFS preview rejects empty/invalid geometry and missing stops without writes', async () => {
	for (const data of [{ ...gtfs, shape: [] }, { ...gtfs, path: [] }, { ...gtfs, shape: [{ ...gtfs.shape[0], shape_pt_lat: 100 }, gtfs.shape[1]] }]) assert.equal((await invoke('import', { data })).status, 400);
	STOPS = [];
	assert.equal((await invoke('import')).status, 400);
	assert.deepEqual(WRITES, []);
});
test('Shape lookup narrows mixed agencies before querying Lines and Patterns', async () => {
	PATTERNS[0].shape = { encoded_polyline: 'encoded' };
	PATTERNS.push({ ...PATTERNS[0], _id: 'foreign', line_id: 'other' });
	const result = await invoke('shapes', { query: { agency_ids: 'A,B' } });
	assert.equal(result.status, 200);
	assert.deepEqual(QUERIES[0], { collection: 'lines', filter: { agency_id: { $in: ['A'] } } });
	const rows = result.response.data as unknown as Row[];
	assert.deepEqual(rows.map(row => row.pattern_id), ['pattern']);
	assert.equal((await invoke('shapes', { query: { agency_ids: 'B' } })).status, 403);
	assert.equal((await invoke('shapes', { query: { agency_ids: ['A'] } })).status, 400);
	assert.equal((await invoke('shapes')).status, 400);
});
test('Missing/inconsistent parent hierarchy is rejected before mutations', async () => {
	ROUTES = [];
	assert.equal((await invoke('delete')).status, 404);
	ROUTES = [{ _id: 'route', line_id: 'other' }];
	assert.equal((await invoke('delete')).status, 409);
	assert.deepEqual(WRITES, []);
});

test('Client rule contracts reject derived event rules and accept only manual definitions', async () => {
	const rules = [{ event: { id: 'event', title: 'Derived' }, kind: 'event_restriction' }];
	assert.equal((await invoke('create', { data: { ...body, rules } })).status, 400);
	assert.equal((await invoke('update', { data: { rules } })).status, 400);
	assert.deepEqual(WRITES, []);
});
