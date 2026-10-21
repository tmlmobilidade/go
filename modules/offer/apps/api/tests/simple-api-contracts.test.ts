import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';

/* * */

type Action = 'create' | 'delete' | 'get' | 'list' | 'lock' | 'update';
type Handler = (request: FastifyRequest<{ Body: unknown, Params: { id: string } }>, reply: FastifyReply<unknown>) => Promise<unknown>;

const resources = [{ entity: 'Zone', label: 'name', plural: 'zones', singular: 'zone' }, { entity: 'Typology', label: 'name', plural: 'typologies', singular: 'typology' }, { entity: 'Fare', label: 'name', plural: 'fares', singular: 'fare' }];

// Only storage is mocked. Tests execute the real handlers, schemas, permissions and response helpers.
let ROW: Record<string, unknown> | undefined;
let ROWS: Record<string, unknown>[];
let WRITES: Record<string, unknown>[];
let DELETED: string[];
let LIST_QUERY: unknown;

const collection = {
	deleteById: async (id: string) => { DELETED.push(id); },
	findById: async () => ROW,
	findMany: async (query: unknown) => {
		LIST_QUERY = query;
		return ROWS;
	},
	insertOne: async (data: Record<string, unknown>) => {
		WRITES.push(data);
		return { ...ROW, ...data };
	},
	updateById: async (_id: string, data: Record<string, unknown>) => {
		WRITES.push(data);
		return { ...ROW, ...data };
	},
	updateOne: async (_query: unknown, data: Record<string, unknown>) => {
		WRITES.push(data);
		ROW = { ...ROW, ...data };
	},
};

mock.module('@tmlmobilidade/go-interfaces-godb', {
	namedExports: { goDb: { offer: Object.fromEntries(resources.map(resource => [resource.plural, collection])) } },
});

function permission(scope: string, action: string, agencyIds = ['A']): Permission {
	return { action, resources: { agency_ids: agencyIds }, scope } as Permission;
}

async function invoke(handler: Handler, body: unknown, permissions: Permission[]) {
	let httpStatus = 200;
	let payload: unknown;
	const reply = {
		header: () => reply,
		send: (value: unknown) => {
			payload = value;
			return reply;
		},
		status: (value: number) => {
			httpStatus = value;
			return reply;
		},
	};
	const request = { body, me: { _id: 'actor' }, params: { id: 'record' }, permissions };
	await handler(request as Parameters<Handler>[0], reply as unknown as FastifyReply<unknown>);
	const response = payload as ApiResponse<Record<string, unknown> | Record<string, unknown>[]>;
	assert.equal(response.status_code, String(httpStatus));
	assert.equal(typeof response.timestamp, 'number');
	assert.equal('statusCode' in response, false);
	return { httpStatus, response };
}

for (const resource of resources) {
	const handlers = Object.fromEntries(await Promise.all(
		(['create', 'delete', 'get', 'list', 'lock', 'update'] as const).map(async (action) => {
			const file = action === 'list' ? resource.plural : resource.singular;
			const exports = await import(`../src/endpoints/${resource.plural}/handlers/${action}-${file}.js`);
			return [action, Object.values(exports)[0]];
		}),
	)) as Record<Action, Handler>;
	const validBody = { agency_ids: ['A'], code: 'CODE', [resource.label]: 'Record' };
	const readPermission = permission('lines', 'read');

	describe(`${resource.plural} API contracts`, () => {
		test.beforeEach(() => {
			ROW = { _id: 'record', is_locked: false, ...validBody };
			ROWS = [ROW];
			WRITES = [];
			DELETED = [];
			LIST_QUERY = undefined;
		});

		test('creates from validated client data and ignores spoofed identity and audit fields', async () => {
			const result = await invoke(handlers.create, { ...validBody, _id: 'spoof', created_at: 1, created_by: 'spoof', updated_at: 1, updated_by: 'spoof' }, [permission(resource.plural, 'create')]);
			assert.equal(result.httpStatus, 200);
			assert.equal(result.response.error, null);
			assert.equal(WRITES.length, 1);
			assert.equal(WRITES[0].created_by, 'actor');
			assert.equal(WRITES[0].updated_by, 'actor');
			for (const key of ['_id', 'created_at', 'updated_at']) assert.equal(key in WRITES[0], false);
			if (resource.plural === 'zones') assert.deepEqual(WRITES[0].geojson, { features: [], type: 'FeatureCollection' });
			if (resource.plural === 'typologies') {
				assert.equal(WRITES[0].color, '#000000');
				assert.equal(WRITES[0].text_color, '#FFFFFF');
			}
			if (resource.plural === 'fares') {
				assert.equal(WRITES[0].price, 0);
				assert.equal(WRITES[0].payment_method, '0');
			}
		});

		test('rejects malformed and missing create/update bodies without writes', async () => {
			for (const body of [null, undefined, [], { ...validBody, [resource.label]: '' }, { ...validBody, agency_ids: 'A' }]) {
				for (const action of ['create', 'update'] as const) {
					const result = await invoke(handlers[action], body, [permission(resource.plural, action)]);
					assert.equal(result.httpStatus, 400);
					assert.equal(result.response.data, null);
				}
			}
			assert.equal(WRITES.length, 0);
		});

		test('rejects invalid domain fields before create and update writes', async () => {
			const invalid = resource.plural === 'zones'
				? { geojson: { features: 'invalid', type: 'FeatureCollection' } }
				: resource.plural === 'typologies' ? { color: '#1234567' } : { price: -1 };
			for (const action of ['create', 'update'] as const) {
				assert.equal((await invoke(handlers[action], { ...validBody, ...invalid }, [permission(resource.plural, action)])).httpStatus, 400);
			}
			assert.equal(WRITES.length, 0);
		});

		test('requires permissions for all agencies on create', async () => {
			const result = await invoke(handlers.create, { ...validBody, agency_ids: ['A', 'B'] }, [permission(resource.plural, 'create')]);
			assert.equal(result.httpStatus, 403);
			assert.equal(WRITES.length, 0);
		});

		test('updates only client fields and assigns the authenticated updater', async () => {
			const result = await invoke(handlers.update, { _id: 'spoof', created_at: 1, created_by: 'spoof', [resource.label]: 'Edited', updated_at: 1, updated_by: 'spoof' }, [permission(resource.plural, 'update')]);
			assert.equal(result.httpStatus, 200);
			assert.deepEqual(WRITES, [{ [resource.label]: 'Edited', updated_by: 'actor' }]);
		});

		test('requires access to current and newly assigned agencies on update', async () => {
			let result = await invoke(handlers.update, { agency_ids: ['B'] }, [permission(resource.plural, 'update')]);
			assert.equal(result.httpStatus, 403);
			result = await invoke(handlers.update, { agency_ids: ['B'] }, [permission(resource.plural, 'update', ['B'])]);
			assert.equal(result.httpStatus, 403);
			assert.equal(WRITES.length, 0);
			result = await invoke(handlers.update, { agency_ids: ['B'] }, [permission(resource.plural, 'update', ['A', 'B'])]);
			assert.equal(result.httpStatus, 200);
			assert.deepEqual(WRITES[0].agency_ids, ['B']);
		});

		test('denies every action without the required permissions', async () => {
			for (const handler of Object.values(handlers)) assert.equal((await invoke(handler, validBody, [])).httpStatus, 403);
			assert.equal(WRITES.length, 0);
			assert.equal(DELETED.length, 0);
		});

		test('returns standard not-found responses for record actions', async () => {
			ROW = undefined;
			for (const action of ['get', 'update', 'lock', 'delete'] as const) {
				const result = await invoke(handlers[action], validBody, [permission(resource.plural, action === 'get' ? 'read' : action)]);
				assert.equal(result.httpStatus, 404);
				assert.equal(result.response.data, null);
			}
			assert.equal(WRITES.length, 0);
		});

		test('reads records with any matching agency and denies nonmatching agencies', async () => {
			ROW = { ...ROW, agency_ids: ['A', 'B'] };
			assert.equal((await invoke(handlers.get, undefined, [readPermission])).httpStatus, 200);
			ROW = { ...ROW, agency_ids: ['B'] };
			assert.equal((await invoke(handlers.get, undefined, [readPermission])).httpStatus, 403);
		});

		test('filters lists by agency permissions and preserves successful empty arrays', async () => {
			ROWS = [];
			const result = await invoke(handlers.list, undefined, [readPermission]);
			assert.equal(result.httpStatus, 200);
			assert.deepEqual(result.response.data, []);
			assert.deepEqual(LIST_QUERY, { agency_ids: { $in: ['A'] } });
		});

		test('unions line and resource navigation permissions for list and detail reads', async () => {
			const permissions = [permission('lines', 'read'), permission(resource.plural, 'nav', ['B'])];
			assert.equal((await invoke(handlers.list, undefined, permissions)).httpStatus, 200);
			assert.deepEqual(LIST_QUERY, { agency_ids: { $in: ['A', 'B'] } });
			ROW = { ...ROW, agency_ids: ['B'] };
			assert.equal((await invoke(handlers.get, undefined, permissions)).httpStatus, 200);
		});

		test('honors allow-all list access', async () => {
			const unrestricted = { ...readPermission, resources: { agency_ids: [PermissionCatalog.ALLOW_ALL_FLAG] } } as Permission;
			assert.equal((await invoke(handlers.list, undefined, [unrestricted])).httpStatus, 200);
			assert.deepEqual(LIST_QUERY, {});
		});

		test('toggles locks in both directions and records the updater', async () => {
			for (const expected of [true, false]) {
				const result = await invoke(handlers.lock, undefined, [permission(resource.plural, 'lock')]);
				assert.equal(result.httpStatus, 200);
				assert.equal(ROW?.is_locked, expected);
				assert.deepEqual(WRITES.at(-1), { is_locked: expected, updated_by: 'actor' });
			}
		});

		test('requires all current agencies for update, lock and deletion', async () => {
			ROW = { ...ROW, agency_ids: ['A', 'B'] };
			for (const action of ['update', 'lock', 'delete'] as const) assert.equal((await invoke(handlers[action], validBody, [permission(resource.plural, action)])).httpStatus, 403);
			assert.equal(WRITES.length, 0);
			assert.equal(DELETED.length, 0);
		});

		test('deletes with a standard success response', async () => {
			const result = await invoke(handlers.delete, undefined, [permission(resource.plural, 'delete')]);
			assert.equal(result.httpStatus, 200);
			assert.equal(result.response.data, undefined);
			assert.deepEqual(DELETED, ['record']);
		});
	});
}
