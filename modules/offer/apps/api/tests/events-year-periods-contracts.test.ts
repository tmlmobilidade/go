import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';

/* * */

type Action = 'create' | 'delete' | 'get' | 'list' | 'lock' | 'update';
type Handler = (request: FastifyRequest<{ Body: unknown, Params: { id: string } }>, reply: FastifyReply<unknown>) => Promise<unknown>;

const resources = [
	{ collection: 'events', label: 'title', plural: 'events', scope: 'events', singular: 'event' },
	{ collection: 'yearPeriods', label: 'name', plural: 'year-periods', scope: 'year_periods', singular: 'year-period' },
];

// Only storage is mocked. Tests execute the real handlers, schemas, permissions and response helpers.
let ROW: Record<string, unknown> | undefined;
let ROWS: Record<string, unknown>[];
let WRITES: Record<string, unknown>[];
let DELETED: string[];
let LIST_QUERY: unknown;
let ASSOCIATED_PATTERNS: Record<string, unknown>[] = [];
let PATTERN_QUERY: unknown;

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
	namedExports: { goDb: { offer: { ...Object.fromEntries(resources.map(resource => [resource.collection, collection])), patterns: { aggregate: async (query: unknown) => {
		PATTERN_QUERY = query;
		return ASSOCIATED_PATTERNS;
	} } } } },
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
	const readPermission = permission(resource.scope, 'read');

	describe(`${resource.plural} API contracts`, () => {
		test.beforeEach(() => {
			ROW = { _id: 'record', created_at: 1_792_368_000_000, created_by: 'original', is_locked: false, updated_at: 1_792_368_000_000, ...validBody };
			ROWS = [ROW];
			WRITES = [];
			DELETED = [];
			LIST_QUERY = undefined;
		});

		test('creates from validated client data and ignores spoofed identity and audit fields', async () => {
			const result = await invoke(handlers.create, { ...validBody, _id: 'spoof', created_at: 1, created_by: 'spoof', updated_at: 1, updated_by: 'spoof' }, [permission(resource.scope, 'create')]);
			assert.equal(result.httpStatus, 200);
			assert.equal(result.response.error, null);
			assert.equal(WRITES.length, 1);
			assert.equal(WRITES[0].created_by, 'actor');
			assert.equal(WRITES[0].updated_by, 'actor');
			for (const key of ['_id', 'created_at', 'updated_at']) assert.equal(key in WRITES[0], false);
		});

		test('rejects malformed and missing create/update bodies without writes', async () => {
			for (const body of [null, undefined, [], { ...validBody, [resource.label]: '' }, { ...validBody, agency_ids: 'A' }]) {
				for (const action of ['create', 'update'] as const) {
					const result = await invoke(handlers[action], body, [permission(resource.scope, action)]);
					assert.equal(result.httpStatus, 400);
					assert.equal(result.response.data, null);
				}
			}
			assert.equal(WRITES.length, 0);
		});

		test('rejects invalid domain fields before create and update writes', async () => {
			const invalid = resource.plural === 'events' ? { code: 'lowercase' } : { dates: 'invalid' };
			for (const action of ['create', 'update'] as const) {
				assert.equal((await invoke(handlers[action], { ...validBody, ...invalid }, [permission(resource.scope, action)])).httpStatus, 400);
			}
			assert.equal(WRITES.length, 0);
		});

		test('requires permissions for all agencies on create', async () => {
			const result = await invoke(handlers.create, { ...validBody, agency_ids: ['A', 'B'] }, [permission(resource.scope, 'create')]);
			assert.equal(result.httpStatus, 403);
			assert.equal(WRITES.length, 0);
		});

		test('updates only client fields and assigns the authenticated updater', async () => {
			const result = await invoke(handlers.update, { _id: 'spoof', created_at: 1, created_by: 'spoof', [resource.label]: 'Edited', updated_at: 1, updated_by: 'spoof' }, [permission(resource.scope, 'update')]);
			assert.equal(result.httpStatus, 200);
			assert.deepEqual(WRITES, [{ [resource.label]: 'Edited', updated_by: 'actor' }]);
		});

		test('requires access to current and newly assigned agencies on update', async () => {
			let result = await invoke(handlers.update, { agency_ids: ['B'] }, [permission(resource.scope, 'update')]);
			assert.equal(result.httpStatus, 403);
			result = await invoke(handlers.update, { agency_ids: ['B'] }, [permission(resource.scope, 'update', ['B'])]);
			assert.equal(result.httpStatus, 403);
			assert.equal(WRITES.length, 0);
			result = await invoke(handlers.update, { agency_ids: ['B'] }, [permission(resource.scope, 'update', ['A', 'B'])]);
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
				const result = await invoke(handlers[action], validBody, [permission(resource.scope, action === 'get' ? 'read' : action)]);
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

		test('honors allow-all list access', async () => {
			const unrestricted = { ...readPermission, resources: { agency_ids: [PermissionCatalog.ALLOW_ALL_FLAG] } } as Permission;
			assert.equal((await invoke(handlers.list, undefined, [unrestricted])).httpStatus, 200);
			assert.deepEqual(LIST_QUERY, {});
		});

		test('toggles locks in both directions and records the updater', async () => {
			for (const expected of [true, false]) {
				const result = await invoke(handlers.lock, undefined, [permission(resource.scope, 'lock')]);
				assert.equal(result.httpStatus, 200);
				assert.equal(ROW?.is_locked, expected);
				assert.deepEqual(WRITES.at(-1), { is_locked: expected, updated_by: 'actor' });
			}
		});

		test('requires all current agencies for update, lock and deletion', async () => {
			ROW = { ...ROW, agency_ids: ['A', 'B'] };
			for (const action of ['update', 'lock', 'delete'] as const) assert.equal((await invoke(handlers[action], validBody, [permission(resource.scope, action)])).httpStatus, 403);
			assert.equal(WRITES.length, 0);
			assert.equal(DELETED.length, 0);
		});

		test('deletes with a standard success response', async () => {
			const result = await invoke(handlers.delete, undefined, [permission(resource.scope, 'delete')]);
			assert.equal(result.httpStatus, 200);
			assert.equal(result.response.data, undefined);
			assert.deepEqual(DELETED, ['record']);
		});
	});
}

/* * */

const { createYearPeriodHandler } = await import('../src/endpoints/year-periods/handlers/create-year-period.js');
const { updateYearPeriodHandler } = await import('../src/endpoints/year-periods/handlers/update-year-period.js');
const { checkYearPeriodsConflictsHandler } = await import('../src/endpoints/year-periods/handlers/check-conflicts.js');
const { getEventHandler } = await import('../src/endpoints/events/handlers/get-event.js');
const { handleYearPeriodDateAssignment } = await import('../src/endpoints/year-periods/utils/handle-date-assignment.js');
const periodHandlers = {
	check: checkYearPeriodsConflictsHandler,
	create: createYearPeriodHandler,
	update: updateYearPeriodHandler,
} as Record<string, Handler>;

// Branded operational dates use the same canonical parser as production requests.
const { OperationalDateSchema } = await import('@tmlmobilidade/go-types-shared');
const firstDate = OperationalDateSchema.parse('20261020');
const secondDate = OperationalDateSchema.parse('20261021');
const thirdDate = OperationalDateSchema.parse('20261022');

function period(id: string, agencyIds: string[], dates = [firstDate]) {
	return { _id: id, agency_ids: agencyIds, created_at: 1_792_368_000_000, created_by: 'original', dates, is_locked: false, name: id, updated_at: 1_792_368_000_000 };
}

describe('period conflicts and assignment', () => {
	test.beforeEach(() => {
		ROW = period('record', ['A']);
		ROWS = [];
		WRITES = [];
		DELETED = [];
		LIST_QUERY = undefined;
	});

	test('reports only overlapping dates for the exact agency set and excludes the current ID', async () => {
		ROWS = [period('same', ['B', 'A'], [firstDate, thirdDate]), period('different', ['A']), period('none', ['B', 'A'], [thirdDate])];
		const result = await invoke(periodHandlers.check, { agency_ids: ['A', 'B'], dates: [firstDate, secondDate], year_period_id: 'record' }, [permission('year_periods', 'read', ['A', 'B'])]);
		assert.equal(result.httpStatus, 200);
		assert.deepEqual(result.response.data, { conflicts: [{ dates: [firstDate], year_period: ROWS[0] }] });
		assert.deepEqual(LIST_QUERY, { _id: { $ne: 'record' }, agency_ids: { $in: ['A', 'B'] } });
		assert.deepEqual(WRITES, []);
	});

	test('validates conflict requests and agency access before querying', async () => {
		assert.equal((await invoke(periodHandlers.check, { agency_ids: ['A'], dates: 'invalid' }, [permission('year_periods', 'read')])).httpStatus, 400);
		assert.equal((await invoke(periodHandlers.check, { agency_ids: ['B'], dates: [firstDate] }, [permission('year_periods', 'read')])).httpStatus, 403);
		assert.equal(LIST_QUERY, undefined);
		assert.deepEqual(WRITES, []);
	});

	test('merges dates and removes overlap only from periods with the exact agency set', async () => {
		ROWS = [period('same', ['A'], [firstDate, thirdDate]), period('different', ['A', 'B'], [firstDate])];
		const result = await handleYearPeriodDateAssignment(['A'], [secondDate], 'actor', 'record', [firstDate]);
		assert.deepEqual(result, [firstDate, secondDate]);
		assert.deepEqual(WRITES, [{ dates: [thirdDate], updated_by: 'actor' }]);
		assert.deepEqual(LIST_QUERY, { _id: { $ne: 'record' }, agency_ids: { $in: ['A'] } });
	});

	test('creates and assigns without a client audit actor', async () => {
		ROWS = [period('old', ['A'], [firstDate, thirdDate])];
		const result = await invoke(periodHandlers.create, { agency_ids: ['A'], dates: [firstDate], name: 'New' }, [permission('year_periods', 'create')]);
		assert.equal(result.httpStatus, 200);
		assert.deepEqual(WRITES[0], { dates: [thirdDate], updated_by: 'actor' });
		assert.equal(WRITES[1].created_by, 'actor');
		assert.deepEqual(WRITES[1].dates, [firstDate]);
	});

	test('reassigns merged dates using target agencies when agencies change', async () => {
		ROWS = [period('target', ['B'], [firstDate, secondDate, thirdDate]), period('old', ['A'], [firstDate])];
		const result = await invoke(periodHandlers.update, { agency_ids: ['B'], dates: [secondDate] }, [permission('year_periods', 'update', ['A', 'B'])]);
		assert.equal(result.httpStatus, 200);
		assert.deepEqual(WRITES, [{ dates: [thirdDate], updated_by: 'actor' }, { agency_ids: ['B'], dates: [firstDate, secondDate], updated_by: 'actor' }]);
		assert.deepEqual(LIST_QUERY, { _id: { $ne: 'record' }, agency_ids: { $in: ['B'] } });
	});

	test('checks conflicts for retained dates when only agencies change', async () => {
		ROWS = [period('target', ['B'], [firstDate, thirdDate])];
		const result = await invoke(periodHandlers.update, { agency_ids: ['B'] }, [permission('year_periods', 'update', ['A', 'B'])]);
		assert.equal(result.httpStatus, 200);
		assert.deepEqual(WRITES, [{ dates: [thirdDate], updated_by: 'actor' }, { agency_ids: ['B'], dates: [firstDate], updated_by: 'actor' }]);
	});

	test('preserves explicit date clearing without reassigning old dates', async () => {
		assert.equal((await invoke(periodHandlers.update, { dates: [] }, [permission('year_periods', 'update')])).httpStatus, 200);
		assert.deepEqual(WRITES, [{ dates: [], updated_by: 'actor' }]);
		assert.equal(LIST_QUERY, undefined);
	});

	test('rejects invalid and unauthorized assignments before changing other periods', async () => {
		ROWS = [period('other', ['B'])];
		assert.equal((await invoke(periodHandlers.create, { agency_ids: ['A'], dates: [firstDate], name: '' }, [permission('year_periods', 'create')])).httpStatus, 400);
		assert.equal((await invoke(periodHandlers.update, { agency_ids: ['B'], dates: [firstDate] }, [permission('year_periods', 'update')])).httpStatus, 403);
		assert.deepEqual(WRITES, []);
		assert.equal(LIST_QUERY, undefined);
	});
});

describe('event detail enrichment', () => {
	test('fetches associated patterns and overrides legacy stored association fields', async () => {
		ROW = { _id: 'event', agency_ids: ['A'], associated_patterns: [{ _id: 'stale' }], code: 'EVENT', title: 'Event' };
		ASSOCIATED_PATTERNS = [{ _id: 'pattern', code: 'P1', headsign: 'Destination', line_id: 'line', route_id: 'route' }];
		const result = await invoke(getEventHandler as Handler, undefined, [permission('events', 'read')]);
		assert.equal(result.httpStatus, 200);
		const data = result.response.data as Record<string, unknown>;
		assert.deepEqual(data.associated_patterns, ASSOCIATED_PATTERNS);
		assert.deepEqual(PATTERN_QUERY, [
			{ $match: { rules: { $elemMatch: { event_id: 'record', kind: 'manual' } } } },
			{ $project: { _id: 1, code: 1, headsign: 1, line_id: 1, route_id: 1 } },
			{ $sort: { code: 1 } },
		]);
	});
});
