import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CreateFareSchema, UpdateFareSchema } from '../src/network/fare.js';
import { CreateTypologySchema, UpdateTypologySchema } from '../src/network/typology.js';
import { CreateZoneSchema, UpdateZoneSchema } from '../src/network/zone.js';

/* * */

for (const { create, name, update } of [
	{ create: CreateTypologySchema, name: 'typologies', update: UpdateTypologySchema },
	{ create: CreateZoneSchema, name: 'zones', update: UpdateZoneSchema },
	{ create: CreateFareSchema, name: 'fares', update: UpdateFareSchema },
]) {
	test(`${name}: lock state is excluded from create and update contracts`, () => {
		const body = { agency_ids: ['A'], code: 'CODE', is_locked: true, name: 'Name' };
		assert.equal('is_locked' in create.parse(body), false);
		assert.equal('is_locked' in update.parse(body), false);
	});
}
