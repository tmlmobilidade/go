import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import { beforeEach, mock, test } from 'node:test';

/* * */

type Row = Record<string, unknown> & { _id: string };
type Handler = (request: FastifyRequest<{ Body: unknown, Params: { id: string } }>, reply: FastifyReply<unknown>) => Promise<unknown>;
const tables: Record<string, Map<string, Row>> = {};
let WRITES: string[];
let QUERIES: { collection: string, filter: unknown }[];
const matches = (row: Row, filter: Record<string, unknown>) => Object.entries(filter).every(([key, value]) => value && typeof value === 'object' && '$in' in value ? (value.$in as unknown[]).includes(row[key]) : row[key] === value);

function collection(name: string) {
	return {
		deleteById: async (id: string) => {
			WRITES.push(`delete:${name}:${id}`);
			tables[name].delete(id);
		},
		deleteMany: async (filter: Record<string, unknown>) => {
			WRITES.push(`deleteMany:${name}`);
			for (const [id, row] of tables[name]) if (matches(row, filter)) tables[name].delete(id);
		},
		findById: async (id: string) => tables[name].get(id) ?? null,
		findMany: async (filter: Record<string, unknown> = {}) => {
			QUERIES.push({ collection: name, filter });
			return [...tables[name].values()].filter(row => matches(row, filter));
		},
		insertOne: async (data: Record<string, unknown>) => {
			WRITES.push(`insert:${name}`);
			const row = { _id: 'new', ...data };
			tables[name].set(row._id, row);
			return row;
		},
		updateOne: async ({ _id }: { _id: string }, data: Record<string, unknown>) => {
			WRITES.push(`${'is_locked' in data ? 'lock' : 'update'}:${name}:${_id}`);
			const row = { ...tables[name].get(_id), ...data, _id };
			tables[name].set(_id, row);
			return row;
		},
	};
}
mock.module('@tmlmobilidade/go-interfaces-godb', { namedExports: { goDb: { offer: Object.fromEntries(['lines', 'routes', 'patterns', 'fares', 'typologies'].map(name => [name, collection(name)])) } } });
async function handlers(plural: string, actions: string[]) {
	return Object.fromEntries(await Promise.all(actions.map(async (action) => {
		const exports = await import(`../src/endpoints/${plural}/handlers/${action}-${action === 'list' ? plural : plural.slice(0, -1)}.js`);
		return [action, Object.values(exports)[0]];
	}))) as Record<string, Handler>;
}
const lines = await handlers('lines', ['create', 'delete', 'get', 'list', 'lock', 'update']);
const routes = await handlers('routes', ['create', 'delete', 'get', 'lock', 'update']);
const lineBody = { agency_id: 'A', code: 'L1', name: 'Line' };
const routeBody = { code: 'R1', line_id: 'line', name: 'Route' };
const audit = { created_at: 1, created_by: 'creator', is_locked: false, updated_at: 2 };

beforeEach(() => {
	for (const name of ['lines', 'routes', 'patterns', 'fares', 'typologies']) tables[name] = new Map();
	tables.lines.set('line', { _id: 'line', ...audit, ...lineBody });
	tables.lines.set('foreign', { _id: 'foreign', ...audit, ...lineBody, agency_id: 'B' });
	tables.routes.set('route', { _id: 'route', ...audit, ...routeBody });
	tables.patterns.set('pattern', { _id: 'pattern', ...audit, code: 'P1', destination: 'Destination', headsign: 'Headsign', line_id: 'line', origin: 'Origin', route_id: 'route' });
	WRITES = [];
	QUERIES = [];
});

async function invoke(handler: Handler, { action = 'read', agencies = ['A'], body = {}, id = 'line', method = 'PUT' }: { action?: string, agencies?: string[], body?: unknown, id?: string, method?: string } = {}) {
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
	const permissions = [{ action, resources: { agency_ids: agencies }, scope: 'lines' }] as Permission[];
	await handler({ body, me: { _id: 'actor' }, method, params: { id }, permissions } as Parameters<Handler>[0], reply as unknown as FastifyReply<unknown>);
	const response = payload as ApiResponse<Row> | undefined;
	if (response) {
		assert.equal(response.status_code, String(status));
		assert.equal(typeof response.timestamp, 'number');
		assert.equal('statusCode' in response, false);
	}
	return { response, status };
}

/* * */

for (const [entity, handlers, body] of [['line', lines, lineBody], ['route', routes, routeBody]] as const) {
	test(`${entity}: create validates input and strips spoofed identity, audit, lock and enrichment`, async () => {
		assert.equal((await invoke(handlers.create, { action: 'create', body: { ...body, name: '' } })).status, 400);
		assert.deepEqual(WRITES, []);
		const result = await invoke(handlers.create, { action: 'create', body: { ...body, _id: 'spoof', created_at: 7, created_by: 'spoof', is_locked: true, patterns: ['spoof'], updated_at: 7, updated_by: 'spoof' } });
		assert.equal(result.status, 200);
		const saved = tables[`${entity}s`].get('new');
		assert.equal(saved?.created_by, 'actor');
		assert.equal(saved?.updated_by, 'actor');
		assert.equal(saved?.is_locked, false);
		assert.equal(saved?.created_at, undefined);
		assert.equal(saved?.patterns, undefined);
	});
	for (const action of ['create', 'get', 'update', 'delete', 'lock']) {
		test(`${entity}: ${action} rejects a foreign agency without WRITES`, async () => {
			assert.equal((await invoke(handlers[action], { action: action === 'get' ? 'read' : action, agencies: ['B'], body, id: entity })).status, 403);
			assert.deepEqual(WRITES, []);
		});
	}
	for (const action of ['update', 'delete']) {
		test(`${entity}: ${action} cannot bypass its own lock`, async () => {
			const row = tables[`${entity}s`].get(entity);
			assert.ok(row);
			row.is_locked = true;
			assert.equal((await invoke(handlers[action], { action, body: { is_locked: false, name: 'Changed' }, id: entity })).status, 409);
			assert.deepEqual(WRITES, []);
		});
	}
	test(`${entity}: update validates fields, strips audits/lock/enrichment and preserves omitted data`, async () => {
		assert.equal((await invoke(handlers.update, { action: 'update', body: { code: 12 }, id: entity })).status, 400);
		assert.deepEqual(WRITES, []);
		assert.equal((await invoke(handlers.update, { action: 'update', body: { created_by: 'spoof', is_locked: true, name: 'Changed', patterns: ['spoof'], updated_by: 'spoof' }, id: entity })).status, 200);
		const saved = tables[`${entity}s`].get(entity);
		assert.equal(saved?.created_by, 'creator');
		assert.equal(saved?.updated_by, 'actor');
		assert.equal(saved?.code, body.code);
		assert.equal(saved?.is_locked, false);
		assert.equal(saved?.patterns, undefined);
	});
	test(`${entity}: lock action records updater; missing record returns 404`, async () => {
		const result = await invoke(handlers.lock, { action: 'lock', id: entity });
		assert.equal(result.response?.data?.is_locked, true);
		assert.equal(result.response?.data?.updated_by, 'actor');
		assert.equal((await invoke(handlers.get, { id: 'missing' })).status, 404);
	});
}

test('Line agency changes require current and target permissions', async () => {
	assert.equal((await invoke(lines.update, { action: 'update', body: { agency_id: 'B' } })).status, 403);
	assert.deepEqual(WRITES, []);
	assert.equal((await invoke(lines.update, { action: 'update', agencies: ['A', 'B'], body: { agency_id: 'B' } })).status, 200);
});
test('Lines list scopes agencies, preserves route enrichment and accepts wildcard', async () => {
	const result = await invoke(lines.list);
	assert.deepEqual(QUERIES[0], { collection: 'lines', filter: { agency_id: { $in: ['A'] } } });
	const rows = result.response?.data as unknown as Row[];
	assert.equal(rows.length, 1);
	assert.equal((rows[0].routes as Row[])[0]._id, 'route');
	QUERIES = [];
	await invoke(lines.list, { agencies: [PermissionCatalog.ALLOW_ALL_FLAG] });
	assert.deepEqual(QUERIES[0], { collection: 'lines', filter: {} });
});
test('Route requires an existing parent and rejects reparenting without WRITES', async () => {
	assert.equal((await invoke(routes.create, { action: 'create', body: { ...routeBody, line_id: 'missing' } })).status, 404);
	assert.equal((await invoke(routes.update, { action: 'update', agencies: ['A', 'B'], body: { line_id: 'foreign' }, id: 'route' })).status, 409);
	assert.deepEqual(WRITES, []);
});
for (const action of ['create', 'update', 'delete', 'lock']) {
	test(`Route ${action} respects its Line lock`, async () => {
		const line = tables.lines.get('line');
		assert.ok(line);
		line.is_locked = true;
		assert.equal((await invoke(routes[action], { action, body: routeBody, id: 'route' })).status, 409);
		assert.deepEqual(WRITES, []);
	});
}
for (const name of ['routes', 'patterns']) {
	test(`Line delete respects locked descendant ${name}`, async () => {
		[...tables[name].values()][0].is_locked = true;
		assert.equal((await invoke(lines.delete, { action: 'delete' })).status, 409);
		assert.deepEqual(WRITES, []);
	});
}
test('Route delete respects locked descendant patterns', async () => {
	[...tables.patterns.values()][0].is_locked = true;
	assert.equal((await invoke(routes.delete, { action: 'delete', id: 'route' })).status, 409);
	assert.deepEqual(WRITES, []);
});
for (const [entity, handlers] of [['line', lines], ['route', routes]] as const) {
	test(`${entity}: cascade removes only its descendants and retains unrelated data`, async () => {
		tables.routes.set('other-route', { _id: 'other-route', line_id: 'foreign' });
		tables.patterns.set('other-pattern', { _id: 'other-pattern', line_id: 'foreign', route_id: 'other-route' });
		assert.equal((await invoke(handlers.delete, { action: 'delete', id: entity })).status, 200);
		assert.deepEqual([...tables.routes.keys()], ['other-route']);
		assert.deepEqual([...tables.patterns.keys()], ['other-pattern']);
		assert.equal(tables.lines.has('line'), entity === 'route');
	});
}
for (const action of ['create', 'get', 'update', 'lock']) {
	test(`Route ${action} returns consistent pattern summaries without storing them`, async () => {
		const result = await invoke(routes[action], { action: action === 'get' ? 'read' : action, body: routeBody, id: 'route' });
		assert.equal(result.status, 200);
		assert.ok(Array.isArray(result.response?.data?.patterns));
		assert.equal(tables.routes.get(action === 'create' ? 'new' : 'route')?.patterns, undefined);
	});
}
