import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getZonesPermissions } from '../src/components/zones/shared/zones-permissions';

/* * */

const permission = (action: 'create' | 'delete' | 'lock' | 'nav' | 'update', agencyIds: string[]): Permission => ({ action, resources: { agency_ids: agencyIds }, scope: 'zones' });

/* * */

test('read-only and missing users cannot mutate zones', () => {
	for (const userPermissions of [undefined, [], [permission('nav', ['A'])]]) {
		assert.deepEqual(getZonesPermissions({ currentAgencyIds: ['A'], selectedAgencyIds: ['A'], userPermissions }), { create: false, delete: false, edit: false, lock: false, update: false });
	}
});

test('editing a zone requires access to every persisted agency', () => {
	const result = getZonesPermissions({ currentAgencyIds: ['A', 'B'], selectedAgencyIds: ['A'], userPermissions: [permission('update', ['A'])] });
	assert.equal(result.edit, false);
	assert.equal(result.update, false);
});

test('replacing agencies cannot bypass access to current agencies', () => {
	const result = getZonesPermissions({ currentAgencyIds: ['A'], selectedAgencyIds: ['B'], userPermissions: [permission('update', ['B'])] });
	assert.equal(result.update, false);
});

test('update requires access to newly selected agencies but keeps the form editable', () => {
	const result = getZonesPermissions({ currentAgencyIds: ['A'], selectedAgencyIds: ['A', 'B'], userPermissions: [permission('update', ['A'])] });
	assert.equal(result.edit, true);
	assert.equal(result.update, false);
});

test('authorized users can assign permitted agencies', () => {
	const userPermissions = [permission('update', ['A', 'B'])];
	assert.equal(getZonesPermissions({ currentAgencyIds: ['A'], selectedAgencyIds: ['A', 'B'], userPermissions }).update, true);
});

test('lock and delete use persisted agencies independently of the form selection', () => {
	const result = getZonesPermissions({ currentAgencyIds: ['A', 'B'], selectedAgencyIds: ['A'], userPermissions: [permission('lock', ['A']), permission('delete', ['B'])] });
	assert.equal(result.lock, false);
	assert.equal(result.delete, false);
});

test('creation omits current agencies and checks all selected agencies', () => {
	assert.equal(getZonesPermissions({ selectedAgencyIds: ['A', 'B'], userPermissions: [permission('create', ['A'])] }).create, false);
	assert.equal(getZonesPermissions({ selectedAgencyIds: ['A', 'B'], userPermissions: [permission('create', ['A', 'B'])] }).create, true);
});

test('global access applies to current and replacement agencies for each action', () => {
	const userPermissions = (['create', 'update', 'lock', 'delete'] as const).map(action => permission(action, [PermissionCatalog.ALLOW_ALL_FLAG]));
	assert.deepEqual(getZonesPermissions({ currentAgencyIds: ['A', 'B'], selectedAgencyIds: ['C'], userPermissions }), { create: true, delete: true, edit: true, lock: true, update: true });
});
