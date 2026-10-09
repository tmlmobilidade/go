import { StopsCreateRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { getStopShortName } from '@tmlmobilidade/go-infrastructure-pckg-utils';
import { LocationSchema } from '@tmlmobilidade/go-types-locations';
import { AllowAllFlagValue, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

/* * */

const location = LocationSchema.parse({
	country: { admin_level: '2', name: 'Portugal', osm_id: 1 },
	primary: { admin_level: '6', name: 'Lisboa', osm_id: 2 },
	secondary: { admin_level: '7', name: 'Lisboa', osm_id: 3 },
	tertiary: { admin_level: '8', name: 'Parish', osm_id: 4 },
});

let availableAgencyIds = ['agency-a', 'agency-b'];
let insertedStops = [];
let locationUnavailable = false;

mock.module('@tmlmobilidade/go-clients-fastify', {
	exports: {
		sendErrorApiResponse: (_reply, response) => response,
		sendSuccessApiResponse: (_reply, data) => ({ data, status_code: '200' }),
	},
});
mock.module('@tmlmobilidade/go-interfaces-godb', {
	exports: {
		goDb: {
			core: { agencies: { aggregate: async () => [], findMany: async filter => availableAgencyIds.filter(id => !filter._id || filter._id.$in.includes(id)).map(_id => ({ _id })) } },
			infrastructure: { stops: { insertOneUnsafe: async (stop) => { insertedStops.push(stop); return stop; } } },
		},
	},
});
mock.module('@tmlmobilidade/go-providers-locations', {
	exports: { locationsProvider: { findLocationByGeo: async () => {
		if (locationUnavailable) throw new Error('No location found');
		return location;
	} } },
});
mock.module('../src/utils/generate-stop-id.ts', {
	exports: { generateStopId: async () => '123456' },
});

const { createStopHandler } = await import('../src/endpoints/stops/handlers/create-stop.ts');

/* * */

function permission(agencyIds, locationIds = ['3'], action = PermissionCatalog.all.stops.actions.create) {
	return { action, resources: { agency_ids: agencyIds, location_ids: locationIds }, scope: PermissionCatalog.all.stops.scope };
}

async function create(permissions, agencyIds, overrides = {}) {
	insertedStops = [];
	return createStopHandler({
		body: { agency_ids: agencyIds, latitude: 38.7, longitude: -9.1, name: 'Rua da Escola', ...overrides },
		me: { _id: 'user' },
		permissions,
	}, {});
}

function assertFlag(agencyIds) {
	assert.equal(insertedStops.length, 1);
	const stop = insertedStops[0];
	assert.equal(stop.flags.length, 1);
	assert.deepEqual(stop.flags[0], {
		agency_ids: agencyIds,
		is_harmonized: true,
		short_name: getStopShortName(stop.name),
		stop_id: stop._id,
	});
	assert.equal(stop.flags[0].short_name, stop.short_name);
}

test('creates one harmonized flag and automatically assigns a sole agency', async () => {
	const result = await create([permission(['agency-a', 'agency-a'])]);
	assert.equal(result.status_code, '200');
	assertFlag(['agency-a']);
});

test('uses selections across duplicate create permission resources and deduplicates IDs', async () => {
	const result = await create([permission(['agency-a']), permission(['agency-b']), permission(['agency-a'])], ['agency-a', 'agency-b', 'agency-a']);
	assert.equal(result.status_code, '200');
	assertFlag(['agency-a', 'agency-b']);
});

test('allows one selected agency when several are permitted', async () => {
	assert.equal((await create([permission(availableAgencyIds)], ['agency-b'])).status_code, '200');
	assertFlag(['agency-b']);
});

test('rejects empty selections when multiple agencies are available', async () => {
	for (const selection of [undefined, []]) {
		assert.equal((await create([permission(availableAgencyIds)], selection)).status_code, '400');
		assert.equal(insertedStops.length, 0);
	}
});

test('blocks creation without available agencies, including deleted resources', async () => {
	for (const ids of [[], ['deleted-agency']]) {
		assert.equal((await create([permission(ids)])).status_code, '403');
		assert.equal(insertedStops.length, 0);
	}
});

test('rejects unauthorized selections even with a sole permitted agency or read permission', async () => {
	assert.equal((await create([permission(['agency-a']), permission(['agency-b'], ['3'], PermissionCatalog.all.stops.actions.read)], ['agency-b'])).status_code, '403');
	assert.equal(insertedStops.length, 0);
});

test('resolves allow_all to actual agencies and never persists the sentinel', async () => {
	assert.equal((await create([permission([AllowAllFlagValue])], ['agency-a', 'agency-b'])).status_code, '200');
	assertFlag(['agency-a', 'agency-b']);
	assert.equal((await create([permission([AllowAllFlagValue])], [AllowAllFlagValue])).status_code, '403');
	assert.equal(insertedStops.length, 0);
	availableAgencyIds = [];
	assert.equal((await create([permission([AllowAllFlagValue])])).status_code, '403');
	availableAgencyIds = ['agency-a'];
	assert.equal((await create([permission([AllowAllFlagValue])])).status_code, '200');
	assertFlag(['agency-a']);
	availableAgencyIds = ['agency-a', 'agency-b'];
});

test('preserves location permissions and location lookup failures', async () => {
	assert.equal((await create([permission(['agency-a'], ['other-location'])])).status_code, '401');
	assert.equal(insertedStops.length, 0);
	locationUnavailable = true;
	assert.equal((await create([permission(['agency-a'])])).status_code, '400');
	assert.equal(insertedStops.length, 0);
	locationUnavailable = false;
});

test('preserves request validation and ignores client-supplied flags', async () => {
	assert.equal(StopsCreateRequestSchema.safeParse({ agency_ids: [42], latitude: 38.7, longitude: -9.1, name: 'Stop' }).success, false);
	for (const overrides of [{ name: 'a' }, { latitude: 100 }, { longitude: -200 }]) {
		assert.equal((await create([permission(['agency-a'])], [], overrides)).status_code, '400');
		assert.equal(insertedStops.length, 0);
	}
	assert.equal((await create([permission(['agency-a'])], [], { flags: [{ is_harmonized: false, stop_id: '999999' }] })).status_code, '200');
	assertFlag(['agency-a']);
});


test('returns an empty agency list so the modal can explain missing agency permissions', async () => {
	const { listAgenciesHandler } = await import('../src/endpoints/stops/handlers/list-agencies.ts');
	const result = await listAgenciesHandler({
		body: { permissions: { actions: [PermissionCatalog.all.stops.actions.create], scope: PermissionCatalog.all.stops.scope } },
		permissions: [permission([])],
	}, {});
	assert.equal(result.status_code, '200');
	assert.deepEqual(result.data, []);
});
