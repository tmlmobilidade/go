import { API_ROUTES, getModuleConfig } from '@tmlmobilidade/consts';
import { BannerDismissalSchema, ChangelogReleaseSchema, ChangelogViewSchema, OperationalBannerSchema } from '@tmlmobilidade/go-types-core';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import assert from 'node:assert/strict';
import { after, beforeEach, mock, test } from 'node:test';

/* * */

interface StoredDocument { [key: string]: unknown, _id: string }
let PERMISSIONS: Permission[] = [];
let USER_ID = 'actor';
let SESSION_VALID = true;
let SESSION_THROWS = false;
let WRITES = 0;
let NEXT_ID = 0;
let CONCURRENT_EDIT = false;
const RELEASES = new Map<string, StoredDocument>();
const BANNERS = new Map<string, StoredDocument>();
const VIEWS = new Map<string, StoredDocument>();
const DISMISSALS = new Map<string, StoredDocument>();

function field(document: unknown, path: string): unknown {
	return path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? Reflect.get(value, key) : undefined, document);
}

function matches(document: StoredDocument, filter: object): boolean {
	return Object.entries(filter).every(([key, expected]) => {
		if (key === '$and' && Array.isArray(expected)) return expected.every(part => matches(document, part));
		if (key === '$or' && Array.isArray(expected)) return expected.some(part => matches(document, part));
		const actual = field(document, key);
		if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
			return Object.entries(expected).every(([operator, operand]) => {
				if (operator === '$in' && Array.isArray(operand)) return operand.includes(actual);
				if (operator === '$lt') return typeof actual === typeof operand && (typeof actual === 'number' && typeof operand === 'number' ? actual < operand : String(actual) < String(operand));
				if (operator === '$lte') return typeof actual === 'number' && typeof operand === 'number' && actual <= operand;
				if (operator === '$gt') return typeof actual === 'number' && typeof operand === 'number' && actual > operand;
				throw new Error(`Unsupported test query operator ${operator}`);
			});
		}
		return Array.isArray(actual) ? actual.includes(expected) : actual === expected;
	});
}

function collection(records: Map<string, StoredDocument>, schema: { parse: (input: unknown) => StoredDocument }) {
	return {
		findById: async (id: string) => records.get(id) ?? null,
		findMany: async (filter: Record<string, unknown> = {}, options: { limit?: number, sort?: [string, number][] } = {}) => {
			const found = [...records.values()].filter(record => matches(record, filter));
			if (options.sort) found.sort((a, b) => {
				for (const [key, direction] of options.sort ?? []) {
					const av = field(a, key);
					const bv = field(b, key);
					const comparison = typeof av === 'number' && typeof bv === 'number' ? Math.sign(av - bv) : String(av).localeCompare(String(bv));
					if (comparison) return direction * comparison;
				}
				return 0;
			});
			return found.slice(0, options.limit);
		},
		findOne: async (filter: Record<string, unknown>) => [...records.values()].find(record => matches(record, filter)) ?? null,
		insertOne: async (input: Record<string, unknown>) => {
			const time = Date.now();
			const document = schema.parse({ ...input, _id: `document-${++NEXT_ID}`, created_at: time, updated_at: time });
			records.set(document._id, document);
			WRITES++;
			return document;
		},
		insertOneIfAbsent: async (input: StoredDocument) => {
			const existing = records.get(input._id);
			if (existing) return existing;
			const document = schema.parse(input);
			records.set(document._id, document);
			WRITES++;
			return document;
		},
		replaceOne: async (filter: Record<string, unknown>, input: StoredDocument, options?: { upsert?: boolean }) => {
			if (CONCURRENT_EDIT) return null;
			const existing = records.get(input._id);
			if ((!existing || !matches(existing, filter)) && !options?.upsert) return null;
			if (existing && !matches(existing, filter)) throw Object.assign(new Error('Duplicate ID'), { code: 11000 });
			const document = schema.parse(input);
			records.set(document._id, document);
			WRITES++;
			return document;
		},
	};
}

mock.module('@tmlmobilidade/go-providers-auth', {
	namedExports: {
		AUTH_SESSION_COOKIE_NAME: 'session_token',
		authProvider: {
			getOrganizationFromSessionToken: async () => ({ _id: 'organization' }),
			getPermissionsFromSessionToken: async () => PERMISSIONS,
			getUserFromSessionToken: async () => {
				if (SESSION_THROWS) throw new Error('Invalid session');
				return SESSION_VALID ? { _id: USER_ID } : null;
			},
		},
	},
});
mock.module('@tmlmobilidade/go-interfaces-godb', {
	namedExports: {
		goDb: { core: {
			bannerDismissals: collection(DISMISSALS, BannerDismissalSchema),
			banners: collection(BANNERS, OperationalBannerSchema),
			changelogs: collection(RELEASES, ChangelogReleaseSchema),
			changelogViews: collection(VIEWS, ChangelogViewSchema),
		} },
	},
});

const { FastifyService } = await import('@tmlmobilidade/go-clients-fastify');
const server = FastifyService.getInstance({ module: 'core', origin: true }).server;
await import('../src/endpoints/changelog-releases/routes.js');
await import('../src/endpoints/operational-banners/routes.js');
await import('../src/endpoints/platform/changelog/routes.js');
await import('../src/endpoints/platform/banners/routes.js');
await server.ready();
after(async () => {
	await server.close();
});
beforeEach(() => {
	PERMISSIONS = [];
	USER_ID = 'actor';
	SESSION_VALID = true;
	SESSION_THROWS = false;
	WRITES = 0;
	NEXT_ID = 0;
	CONCURRENT_EDIT = false;
	for (const records of [RELEASES, BANNERS, VIEWS, DISMISSALS]) records.clear();
});

const cookies = { session_token: 'test-session' };
const scope = { type: 'platform' };
const change = { _id: 'change', category: 'improvement', title: 'Clearer validation' };
const releaseContent = { items: [change], scope, summary: 'Better feedback.', title: 'Offer update' };
const bannerContent = { dismissible: true, kind: 'maintenance', message: 'Offer will be unavailable.', scope, title: 'Planned maintenance' };
const time = Date.now() - 1000;
const audit = { created_at: time, created_by: 'maintainer', updated_at: time };
const publication = { published_at: time, published_by: 'maintainer', status: 'published' };
function release(id = 'release', patch: Record<string, unknown> = {}) {
	const document = ChangelogReleaseSchema.parse({ ...audit, ...publication, ...releaseContent, _id: id, ...patch });
	RELEASES.set(id, document);
	return document;
}
function banner(id = 'banner', patch: Record<string, unknown> = {}) {
	const document = OperationalBannerSchema.parse({ ...audit, ...publication, ...bannerContent, _id: id, ...patch });
	BANNERS.set(id, document);
	return document;
}
function grant() {
	PERMISSIONS = (['changelogs', 'banners'] as const).flatMap(permissionScope => (['read', 'update'] as const).map(action => ({ action, scope: permissionScope })));
}

/* * */

test('all management routes enforce their permissions before storage writes', async () => {
	for (const namespace of ['changelog-releases', 'operational-banners']) {
		for (const route of [
			{ method: 'GET', url: `/${namespace}/` }, { method: 'GET', url: `/${namespace}/id` },
			{ method: 'POST', url: `/${namespace}/` }, { method: 'PUT', url: `/${namespace}/id` },
		]) {
			const response = await server.inject({ ...route, cookies, method: route.method === 'GET' ? 'GET' : route.method === 'PUT' ? 'PUT' : 'POST' });
			assert.equal(response.statusCode, 403, route.url);
		}
	}
	assert.equal(WRITES, 0);
});

test('reader routes require authentication and do not write on background reads', async () => {
	release();
	for (const url of ['/platform/changelog/', '/platform/banners/']) {
		const response = await server.inject({ url });
		assert.equal(response.statusCode, 401);
	}
	const response = await server.inject({ cookies, url: '/platform/changelog/' });
	assert.equal(response.statusCode, 200);
	assert.equal(response.headers['cache-control'], 'no-store');
	assert.equal(WRITES, 0);
});

test('missing users and session lookup failures also return HTTP 401', async () => {
	SESSION_VALID = false;
	assert.equal((await server.inject({ cookies, url: '/platform/changelog/' })).statusCode, 401);
	SESSION_VALID = true;
	SESSION_THROWS = true;
	assert.equal((await server.inject({ cookies, url: '/platform/changelog/' })).statusCode, 401);
	assert.equal(WRITES, 0);
});

test('release updates manage publication status and record the authenticated author', async () => {
	PERMISSIONS = [{ action: 'update', scope: 'changelogs' }];
	const create = await server.inject({ cookies, method: 'POST', payload: { ...releaseContent, created_by: 'spoof', status: 'published' }, url: '/changelog-releases/' });
	assert.equal(create.statusCode, 200);
	const created = create.json<{ data: { _id: string, created_by: string, status: string } }>().data;
	assert.equal(created.created_by, 'actor');
	assert.equal(created.status, 'draft');
	assert.equal((await server.inject({ cookies, url: `/platform/changelog/${created._id}` })).statusCode, 404);
	const publish = await server.inject({ cookies, method: 'PUT', payload: { status: 'published' }, url: `/changelog-releases/${created._id}` });
	assert.equal(publish.statusCode, 200);
	assert.equal(publish.json<{ data: { published_by: string } }>().data.published_by, 'actor');
	const publishedAt = RELEASES.get(created._id)?.published_at;
	assert.equal((await server.inject({ cookies, method: 'PUT', payload: { status: 'published', title: 'Revised release' }, url: `/changelog-releases/${created._id}` })).statusCode, 200);
	assert.equal(RELEASES.get(created._id)?.published_at, publishedAt);
	const detail = await server.inject({ cookies, url: `/platform/changelog/${created._id}` });
	assert.equal(detail.statusCode, 200);
	const data = detail.json<{ data: Record<string, unknown> }>().data;
	for (const key of ['created_by', 'updated_by', 'status', 'published_by', 'is_locked']) assert.equal(key in data, false);
	assert.equal((await server.inject({ cookies, method: 'PUT', payload: { status: 'draft' }, url: `/changelog-releases/${created._id}` })).statusCode, 200);
	assert.equal((await server.inject({ cookies, url: `/platform/changelog/${created._id}` })).statusCode, 404);
	assert.equal((await server.inject({ cookies, method: 'PUT', payload: { status: 'archived' }, url: `/changelog-releases/${created._id}` })).statusCode, 200);
	assert.equal(RELEASES.get(created._id)?.status, 'archived');
	assert.equal(RELEASES.get(created._id)?.published_at, publishedAt);
});

test('updates validate publication content and read-only access cannot write', async () => {
	PERMISSIONS = [{ action: 'update', scope: 'changelogs' }];
	release('draft', { items: [], status: 'draft', summary: '', title: '' });
	assert.equal((await server.inject({ cookies, method: 'PUT', payload: { status: 'published' }, url: '/changelog-releases/draft' })).statusCode, 400);
	assert.equal(WRITES, 0);
	const publish = await server.inject({ cookies, method: 'PUT', payload: { ...releaseContent, published_at: 123, published_by: 'spoof', status: 'published' }, url: '/changelog-releases/draft' });
	assert.equal(publish.statusCode, 200);
	assert.equal(RELEASES.get('draft')?.published_by, 'actor');
	assert.equal(typeof RELEASES.get('draft')?.published_at, 'number');
	assert.notEqual(RELEASES.get('draft')?.published_at, 123);
	assert.equal((await server.inject({ cookies, method: 'PUT', payload: { status: 'invalid' }, url: '/changelog-releases/draft' })).statusCode, 400);
	PERMISSIONS = [{ action: 'read', scope: 'changelogs' }, { action: 'read', scope: 'banners' }];
	for (const [namespace, content] of [['changelog-releases', releaseContent], ['operational-banners', bannerContent]] as const) {
		assert.equal((await server.inject({ cookies, method: 'POST', payload: content, url: `/${namespace}/` })).statusCode, 403);
		assert.equal((await server.inject({ cookies, method: 'PUT', payload: { status: 'published' }, url: `/${namespace}/draft` })).statusCode, 403);
	}
	assert.equal(WRITES, 1);
});

test('published releases return the full feed with deterministic ordering, compact counts, and scope filtering', async () => {
	release('a');
	release('b');
	release('c', { scope: { module_ids: ['offer'], type: 'modules' } });
	release('hidden', { status: 'draft' });
	release('archived', { status: 'archived' });
	const response = await server.inject({ cookies, url: '/platform/changelog/?module_id=operation' });
	assert.equal(response.statusCode, 200);
	const items = response.json<{ data: { _id: string, category_counts: { improvement: number }, is_seen: boolean }[] }>().data;
	assert.deepEqual(items.map(item => item._id), ['b', 'a']);
	assert.equal(items[0].category_counts.improvement, 1);
	assert.equal(items.every(item => !item.is_seen), true);
	assert.equal('items' in items[0], false);
	assert.equal((await server.inject({ cookies, url: '/platform/changelog/?module_id=unknown' })).statusCode, 400);

	// Return every release, including feeds larger than the old default page size.
	for (let index = 0; index < 25; index++) release(`older-${index}`, { published_at: time - index - 1 });
	const full = await server.inject({ cookies, url: '/platform/changelog/' });
	const releases = full.json<{ data: { _id: string }[] }>().data;
	assert.equal(releases.length, 28);
	assert.deepEqual(releases.slice(0, 3).map(item => item._id), ['c', 'b', 'a']);
	assert.equal(releases.at(-1)?._id, 'older-24');
	assert.equal(WRITES, 0);
});

test('seen acknowledgements are idempotent, isolated per user, and limited to requested published IDs', async () => {
	release('one');
	release('two');
	release('draft', { status: 'draft' });
	const payload = { release_ids: ['two'], seen_at: 1, user_id: 'spoof' };
	assert.equal((await server.inject({ cookies, method: 'POST', payload, url: '/platform/changelog/seen' })).statusCode, 200);
	const seen = [...VIEWS.values()][0];
	assert.equal(seen.user_id, 'actor');
	assert.equal(VIEWS.size, 1);
	assert.equal((await server.inject({ cookies, method: 'POST', payload, url: '/platform/changelog/seen' })).statusCode, 200);
	assert.deepEqual([...VIEWS.values()], [seen]);
	const feed = await server.inject({ cookies, url: '/platform/changelog/' });
	const summaries = feed.json<{ data: { _id: string, is_seen: boolean }[] }>().data;
	assert.equal(summaries.find(item => item._id === 'two')?.is_seen, true);
	assert.equal(summaries.find(item => item._id === 'one')?.is_seen, false);
	for (const ids of [['draft'], ['missing'], ['one', 'one'], []]) {
		assert.notEqual((await server.inject({ cookies, method: 'POST', payload: { release_ids: ids }, url: '/platform/changelog/seen' })).statusCode, 200);
	}
	assert.equal(VIEWS.size, 1);
	USER_ID = 'another-user';
	assert.equal((await server.inject({ cookies, method: 'POST', payload, url: '/platform/changelog/seen' })).statusCode, 200);
	assert.equal(VIEWS.size, 2);
	USER_ID = 'actor';
	assert.equal((await server.inject({ cookies, method: 'POST', payload: { release_ids: ['one'] }, url: '/platform/changelog/seen' })).statusCode, 200);
	assert.equal((await server.inject({ cookies, url: '/platform/changelog/' })).json<{ data: { is_seen: boolean }[] }>().data.every(item => item.is_seen), true);
});

test('empty feeds return successful empty states and management lists are trimmed', async () => {
	grant();
	const empty = await server.inject({ cookies, url: '/platform/changelog/' });
	assert.deepEqual(empty.json<{ data: unknown }>().data, []);
	assert.deepEqual((await server.inject({ cookies, url: '/platform/banners/' })).json<{ data: unknown }>().data, []);
	release();
	const managed = await server.inject({ cookies, url: '/changelog-releases/?status=published' });
	assert.equal(managed.statusCode, 200);
	assert.equal('items' in managed.json<{ data: Record<string, unknown>[] }>().data[0], false);
	assert.deepEqual(managed.json<{ data: { category_counts: Record<string, number> }[] }>().data[0].category_counts, { bug_fix: 0, improvement: 1, new_feature: 0 });
});

test('active banners respect scope, schedules, severity ordering, and user-specific dismissals', async () => {
	banner('info');
	banner('critical', { severity: 'critical' });
	banner('warning', { severity: 'warning' });
	banner('offer', { scope: { module_ids: ['offer'], type: 'modules' } });
	banner('future', { starts_at: Date.now() + 60_000 });
	banner('expired', { ends_at: Date.now() - 1 });
	banner('draft', { status: 'draft' });
	const list = await server.inject({ cookies, url: '/platform/banners/?module_id=operation' });
	assert.deepEqual(list.json<{ data: { _id: string }[] }>().data.map(entry => entry._id), ['critical', 'warning', 'info']);
	const offer = await server.inject({ cookies, url: '/platform/banners/?module_id=offer' });
	assert.equal(offer.json<{ data: { _id: string }[] }>().data.some(entry => entry._id === 'offer'), true);
	assert.equal((await server.inject({ cookies, method: 'POST', payload: { dismissal_version: 1 }, url: '/platform/banners/offer/dismiss' })).statusCode, 404);
	assert.equal((await server.inject({ cookies, method: 'POST', payload: { dismissal_version: 1, module_id: 'offer' }, url: '/platform/banners/offer/dismiss' })).statusCode, 200);
	const dismiss = await server.inject({ cookies, method: 'POST', payload: { dismissal_version: 1 }, url: '/platform/banners/info/dismiss' });
	assert.equal(dismiss.statusCode, 200);
	const afterDismissal = await server.inject({ cookies, url: '/platform/banners/' });
	assert.equal(afterDismissal.json<{ data: { _id: string }[] }>().data.some(entry => entry._id === 'info'), false);
	USER_ID = 'another-user';
	assert.equal((await server.inject({ cookies, url: '/platform/banners/' })).json<{ data: { _id: string }[] }>().data.some(entry => entry._id === 'info'), true);
});

test('banner material updates increment server-owned versions and show the notice again', async () => {
	grant();
	banner();
	assert.equal((await server.inject({ cookies, method: 'POST', payload: { dismissal_version: 1 }, url: '/platform/banners/banner/dismiss' })).statusCode, 200);
	const unchanged = await server.inject({ cookies, method: 'PUT', payload: { dismissal_version: 100, updated_by: 'spoof' }, url: '/operational-banners/banner' });
	assert.equal(unchanged.statusCode, 200);
	assert.equal(BANNERS.get('banner')?.dismissal_version, 1);
	const edit = await server.inject({ cookies, method: 'PUT', payload: { message: 'Maintenance has been extended.' }, url: '/operational-banners/banner' });
	assert.equal(edit.statusCode, 200);
	assert.equal(BANNERS.get('banner')?.dismissal_version, 2);
	assert.equal(BANNERS.get('banner')?.updated_by, 'actor');
	assert.equal((await server.inject({ cookies, url: '/platform/banners/' })).json<{ data: unknown[] }>().data.length, 1);
	assert.equal((await server.inject({ cookies, method: 'POST', payload: { dismissal_version: 1 }, url: '/platform/banners/banner/dismiss' })).statusCode, 409);
});

test('banner creation, publication, schedule edits and deactivation validate complete documents', async () => {
	PERMISSIONS = [{ action: 'update', scope: 'banners' }];
	const created = await server.inject({ cookies, method: 'POST', payload: bannerContent, url: '/operational-banners/' });
	const id = created.json<{ data: { _id: string } }>().data._id;
	assert.equal(created.statusCode, 200);
	assert.equal((await server.inject({ cookies, method: 'PUT', payload: { status: 'published' }, url: `/operational-banners/${id}` })).statusCode, 200);
	assert.equal(BANNERS.get(id)?.dismissal_version, 1);
	assert.equal(BANNERS.get(id)?.published_by, 'actor');
	assert.equal((await server.inject({ cookies, method: 'PUT', payload: { starts_at: Date.now() + 60_000 }, url: `/operational-banners/${id}` })).statusCode, 200);
	assert.equal((await server.inject({ cookies, method: 'PUT', payload: { ends_at: Date.now() }, url: `/operational-banners/${id}` })).statusCode, 400);
	assert.equal((await server.inject({ cookies, method: 'PUT', payload: { ends_at: 123 }, url: `/operational-banners/${id}` })).statusCode, 400);
	assert.equal((await server.inject({ cookies, method: 'PUT', payload: { status: 'draft' }, url: `/operational-banners/${id}` })).statusCode, 200);
	assert.equal((await server.inject({ cookies, method: 'PUT', payload: { status: 'archived' }, url: `/operational-banners/${id}` })).statusCode, 200);
	assert.equal(BANNERS.get(id)?.status, 'archived');
	assert.equal(BANNERS.get(id)?.dismissal_version, 2);
});

test('nondismissible, unavailable, stale, and newer recorded banner dismissals cannot be overwritten', async () => {
	banner('fixed', { dismissible: false });
	banner('expired', { ends_at: Date.now() - 1 });
	banner('current');
	for (const [id, expectedStatus] of [['fixed', 409], ['expired', 404], ['missing', 404]] as const) {
		assert.equal((await server.inject({ cookies, method: 'POST', payload: { dismissal_version: 1 }, url: `/platform/banners/${id}/dismiss` })).statusCode, expectedStatus);
	}
	const newer = { _id: JSON.stringify(['actor', 'current']), banner_id: 'current', dismissal_version: 2, dismissed_at: Date.now(), user_id: 'actor' };
	DISMISSALS.set(newer._id, newer);
	assert.equal((await server.inject({ cookies, method: 'POST', payload: { dismissal_version: 1 }, url: '/platform/banners/current/dismiss' })).statusCode, 409);
	assert.deepEqual(DISMISSALS.get(newer._id), newer);
});

test('concurrent edits and locked documents fail without overwriting content', async () => {
	grant();
	const original = release();
	banner('locked', { is_locked: true });
	CONCURRENT_EDIT = true;
	assert.equal((await server.inject({ cookies, method: 'PUT', payload: { status: 'archived', title: 'Overwrite' }, url: '/changelog-releases/release' })).statusCode, 409);
	assert.deepEqual(RELEASES.get('release'), original);
	assert.equal((await server.inject({ cookies, method: 'PUT', payload: { message: 'Overwrite', status: 'archived' }, url: '/operational-banners/locked' })).statusCode, 409);
	assert.equal(WRITES, 0);
});

test('generated reader URLs reach the registered routes', async () => {
	const url = API_ROUTES.core.CHANGELOG_LIST.replace(getModuleConfig('core', 'api_url'), '');
	assert.equal((await server.inject({ cookies, url })).statusCode, 200);
});
