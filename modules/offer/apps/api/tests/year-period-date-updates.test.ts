import * as mongo from '@tmlmobilidade/go-clients-mongo';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import assert from 'node:assert/strict';
import { beforeEach, mock, test } from 'node:test';

/* * */

interface PeriodRecord {
	_id: string
	agency_ids: string[]
	dates: string[]
	is_locked: boolean
	name: string
	updated_by?: string
}

let PERIODS: PeriodRecord[];
let FAIL_TARGET_WRITE = false;
const operations: string[] = [];
const session = {
	endSession: async () => { operations.push('end'); },
	withTransaction: async (callback: () => Promise<void>) => {
		const before = structuredClone(PERIODS);
		try {
			await callback();
			operations.push('commit');
		} catch (error) {
			PERIODS = before;
			operations.push('abort');
			throw error;
		}
	},
};

mock.module('@tmlmobilidade/go-clients-mongo', {
	namedExports: { ...mongo, MongoDatabaseClient: { getClient: async () => ({ startSession: () => session }) } },
});
mock.module('@tmlmobilidade/go-interfaces-godb', {
	namedExports: { goDb: { offer: { yearPeriods: {
		findById: async (id: string, options: { session: unknown }) => {
			assert.equal(options.session, session);
			return PERIODS.find(period => period._id === id);
		},
		findMany: async (_query: unknown, options: { session: unknown }) => {
			assert.equal(options.session, session);
			return PERIODS;
		},
		updateOne: async (query: { _id: string }, data: Partial<PeriodRecord>, options: { session: unknown }) => {
			assert.equal(options.session, session);
			if (FAIL_TARGET_WRITE && query._id === 'target') throw new Error('target write failed');
			const period = PERIODS.find(period => period._id === query._id);
			assert.ok(period);
			Object.assign(period, data);
			operations.push(`write:${period._id}`);
			return period;
		},
	} } } },
});

const { updateYearPeriodDatesHandler } = await import('../src/endpoints/year-periods/handlers/update-year-period-dates.js');

async function invoke(body: unknown, agencyIds = ['A', 'B']) {
	let status = 200;
	let payload: unknown;
	const reply = {
		header: () => reply,
		send: (data: unknown) => {
			payload = data;
			return reply;
		},
		status: (code: number) => {
			status = code;
			return reply;
		},
	};
	const permission = { action: 'update', resources: { agency_ids: agencyIds }, scope: 'year_periods' } as Permission;
	const request = { body, me: { _id: 'actor' }, params: { id: 'target' }, permissions: [permission] };
	await updateYearPeriodDatesHandler(request as unknown as Parameters<typeof updateYearPeriodDatesHandler>[0], reply as unknown as Parameters<typeof updateYearPeriodDatesHandler>[1]);
	return { payload, status };
}

beforeEach(() => {
	PERIODS = [
		{ _id: 'target', agency_ids: ['A'], dates: ['20260101', '20260102'], is_locked: false, name: 'Target' },
		{ _id: 'shared', agency_ids: ['A', 'B'], dates: ['20260103', '20260104'], is_locked: false, name: 'Shared' },
	];
	operations.length = 0;
	FAIL_TARGET_WRITE = false;
});

test('adds and removes dates and transfers any shared-operator conflicts in one session', async () => {
	const result = await invoke({ add_dates: ['20260103'], remove_dates: ['20260101'] });
	assert.equal(result.status, 200);
	assert.deepEqual(PERIODS.map(period => period.dates), [['20260102', '20260103'], ['20260104']]);
	assert.ok(PERIODS.every(period => period.updated_by === 'actor'));
	assert.deepEqual(operations, ['write:shared', 'write:target', 'commit', 'end']);
});

test('blocks a locked conflicting period before any writes', async () => {
	PERIODS[1].is_locked = true;
	assert.equal((await invoke({ add_dates: ['20260103'] })).status, 409);
	assert.ok(!operations.some(operation => operation.startsWith('write:')));
});

test('requires update access to all operators of a conflicting period', async () => {
	assert.equal((await invoke({ add_dates: ['20260103'] }, ['A'])).status, 403);
	assert.ok(!operations.some(operation => operation.startsWith('write:')));
});

test('blocks a locked target and an unauthorized target', async () => {
	PERIODS[0].is_locked = true;
	assert.equal((await invoke({ remove_dates: ['20260101'] })).status, 409);
	PERIODS[0].is_locked = false;
	assert.equal((await invoke({ remove_dates: ['20260101'] }, ['B'])).status, 403);
	assert.ok(!operations.some(operation => operation.startsWith('write:')));
});

test('rolls back conflict removals if the target write fails', async () => {
	const before = structuredClone(PERIODS);
	FAIL_TARGET_WRITE = true;
	await assert.rejects(invoke({ add_dates: ['20260103'] }), /target write failed/);
	assert.deepEqual(PERIODS, before);
	assert.deepEqual(operations, ['write:shared', 'abort', 'end']);
});

test('rejects overlapping additions and removals before accessing storage', async () => {
	assert.equal((await invoke({ add_dates: ['20260101'], remove_dates: ['20260101'] })).status, 400);
	assert.deepEqual(operations, []);
});

test('removes dates without transferring them to another period', async () => {
	assert.equal((await invoke({ remove_dates: ['20260101'] })).status, 200);
	assert.deepEqual(PERIODS[0].dates, ['20260102']);
	assert.deepEqual(operations, ['write:target', 'commit', 'end']);
});
