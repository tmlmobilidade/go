import { OfferZonesV1ExtractionSchema } from '@tmlmobilidade/go-types-extractions';
import { type Permission, PermissionCatalog, PermissionSchema } from '@tmlmobilidade/go-types-permissions';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, mock, test } from 'node:test';

import { type OfferZonesV1QueryRow } from '../src/versions/v1/types.js';

/* * */

let permissions: Permission[] = [];
let rows: OfferZonesV1QueryRow[] = [];
let cursorError: Error | undefined;
let directory: string;

const closeCursor = mock.fn(async () => undefined);
const find = mock.fn(() => ({
	async* [Symbol.asyncIterator]() {
		yield* rows;
		if (cursorError) throw cursorError;
	},
	close: closeCursor,
}));
const getCollection = mock.fn(async () => ({ find }));
const getPermissions = mock.fn(async (userId: string) => {
	assert.equal(userId, 'user-1');
	return permissions;
});

mock.module('@tmlmobilidade/go-interfaces-godb', {
	exports: { goDb: { offer: { zones: { getCollection } } } },
});
mock.module('@tmlmobilidade/go-providers-auth', {
	exports: { authProvider: { getPermissionsFromUserId: getPermissions } },
});

const { extractOfferZonesV1 } = await import('../src/index.js');
const { buildZonesExtractionQuery } = await import('../src/versions/v1/apply-query.js');
const { parseZonesExtraction } = await import('../src/versions/v1/transform.js');

const extraction = OfferZonesV1ExtractionSchema.parse({
	_id: 'extraction-1',
	created_at: 1_760_918_400_000,
	created_by: 'user-1',
	properties: { zone_ids: ['zone-1', 'zone-2'] },
	updated_at: 1_760_918_400_000,
	version: 'offer-zones-v1',
});
const header = '\uFEFF_id,code,name,agency_ids\n';

function permission(scope: string, action: string, agency_ids: string[]) {
	return PermissionSchema.parse({ action, resources: { agency_ids }, scope });
}

async function extract() {
	return extractOfferZonesV1({ attachment_name: 'zones.zip', output_path: directory }, extraction);
}

function readCsv() {
	return fs.readFileSync(path.join(directory, 'zones.csv'), 'utf8');
}

beforeEach(() => {
	permissions = [permission('zones', 'nav', ['agency-1'])];
	rows = [];
	cursorError = undefined;
	directory = fs.mkdtempSync(path.join(os.tmpdir(), 'offer-zones-v1-'));
	closeCursor.mock.resetCalls();
	find.mock.resetCalls();
	getCollection.mock.resetCalls();
	getPermissions.mock.resetCalls();
});

afterEach(() => {
	fs.rmSync(directory, { force: true, recursive: true });
});

for (const [scope, action] of [['lines', 'read'], ['lines', 'update'], ['zones', 'nav']]) {
	test(`uses ${scope}.${action} agency access and always restricts requested zone IDs`, async () => {
		permissions = [permission(scope, action, ['agency-1'])];
		const { filter, projection } = await buildZonesExtractionQuery(extraction);
		assert.deepEqual(filter, {
			_id: { $in: ['zone-1', 'zone-2'] },
			agency_ids: { $in: ['agency-1'] },
		});
		assert.deepEqual(Object.keys(projection).sort(), ['_id', 'agency_ids', 'code', 'name']);
		assert.equal(getPermissions.mock.callCount(), 1);
	});
}

test('combines permitted agencies without accepting unrelated actions', async () => {
	permissions = [
		permission('zones', 'nav', ['agency-1']),
		permission('lines', 'read', ['agency-2']),
		permission('zones', 'update', [PermissionCatalog.ALLOW_ALL_FLAG]),
	];
	const { filter } = await buildZonesExtractionQuery(extraction);
	assert.deepEqual(filter, {
		_id: { $in: ['zone-1', 'zone-2'] },
		agency_ids: { $in: ['agency-2', 'agency-1'] },
	});
});

test('wildcard agency access still restricts the requested zone IDs', async () => {
	permissions = [permission('zones', 'nav', [PermissionCatalog.ALLOW_ALL_FLAG])];
	assert.deepEqual((await buildZonesExtractionQuery(extraction)).filter, {
		_id: { $in: ['zone-1', 'zone-2'] },
	});
});

test('refuses missing, empty and unrelated read permissions before querying zones', async () => {
	for (const denied of [[], [permission('zones', 'nav', [])], [permission('zones', 'update', [PermissionCatalog.ALLOW_ALL_FLAG])]]) {
		permissions = denied;
		await assert.rejects(extract, /not authorized to read zones/);
	}
	assert.equal(getCollection.mock.callCount(), 0);
	assert.deepEqual(fs.readdirSync(directory), []);
});

test('refuses an empty zone selection before loading permissions or querying zones', async () => {
	await assert.rejects(() => extractOfferZonesV1(
		{ attachment_name: 'zones.zip', output_path: directory },
		{ ...extraction, properties: { zone_ids: [] } },
	), /At least one zone ID is required/);
	assert.equal(getPermissions.mock.callCount(), 0);
	assert.equal(getCollection.mock.callCount(), 0);
});

test('writes the fixed CSV columns, escaping commas, quotes and newlines, with one row per zone', async () => {
	rows = [{ _id: 'zone-1', agency_ids: ['agency-1', 'agency-2'], code: 'C,1', name: 'North "A"\nSouth' }];
	assert.equal(await extract(), undefined);
	assert.equal(readCsv(), `${header}zone-1,"C,1","North ""A""\nSouth",agency-1|agency-2\n`);
	assert.deepEqual(fs.readdirSync(directory), ['zones.csv']);
	assert.equal(find.mock.callCount(), 1);
	assert.deepEqual(find.mock.calls[0].arguments, [
		{ _id: { $in: ['zone-1', 'zone-2'] }, agency_ids: { $in: ['agency-1'] } },
		{ batchSize: 5_000, projection: { _id: 1, agency_ids: 1, code: 1, name: 1 }, sort: { _id: 1 } },
	]);
	assert.equal(closeCursor.mock.callCount(), 1);
});

test('formats missing metadata as empty strings', () => {
	// Older stored records can lack fields required by the current zone schema.
	assert.deepEqual(parseZonesExtraction({ _id: 'zone-1' } as OfferZonesV1QueryRow), {
		_id: 'zone-1',
		agency_ids: '',
		code: '',
		name: '',
	});
});

test('writes the header when no selected zones match', async () => {
	await extract();
	assert.equal(readCsv(), header);
	assert.equal(closeCursor.mock.callCount(), 1);
});

test('flushes multiple batches without duplicating the header or losing the final row', async () => {
	rows = Array.from({ length: 10_001 }, (_, index) => ({
		_id: `zone-${index}`,
		agency_ids: ['agency-1'],
		code: String(index),
		name: `Zone ${index}`,
	}));
	await extract();
	const lines = readCsv().trimEnd().split('\n');
	assert.equal(lines.length, rows.length + 1);
	assert.equal(new Set(lines.slice(1)).size, rows.length);
	assert.equal(lines[1], 'zone-0,0,Zone 0,agency-1');
	assert.equal(lines.at(-1), 'zone-10000,10000,Zone 10000,agency-1');
	assert.equal(closeCursor.mock.callCount(), 1);
});

test('closes the cursor when iteration fails', async () => {
	cursorError = new Error('Cursor failed');
	await assert.rejects(extract, /Cursor failed/);
	assert.equal(closeCursor.mock.callCount(), 1);
});

test('closes the cursor when creating the CSV fails', async (context) => {
	context.mock.method(fs, 'writeFileSync', () => { throw new Error('Header failed'); });
	await assert.rejects(extract, /Header failed/);
	assert.equal(closeCursor.mock.callCount(), 1);
});

test('propagates a failed append without retrying a partially written batch', async (context) => {
	rows = [{ _id: 'zone-1', agency_ids: ['agency-1'], code: '1', name: 'Zone 1' }];
	const appendFileSync = fs.appendFileSync;
	const append = context.mock.method(fs, 'appendFileSync', () => {
		appendFileSync(path.join(directory, 'zones.csv'), 'partial');
		throw new Error('Append failed');
	});
	await assert.rejects(extract, /Append failed/);
	assert.equal(append.mock.callCount(), 1);
	assert.equal(closeCursor.mock.callCount(), 1);
});
