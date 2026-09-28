import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveLocation } from '../src/location/resolve-location.js';

/* * */

const row = (id: string, admin_level: string, name: string, tags: Record<string, string> = {}) => ({ admin_level, code: null, id, name, tags });

// A point in Lisbon: PT uses admin_levels 2 / 6 / 7 / 8; level 4 (unused by PT) must be ignored.
const lisbon = [
	row('295480', '2', 'Portugal', { 'ISO3166-1': 'PT' }),
	row('1', '4', 'Área Metropolitana de Lisboa'),
	row('2', '6', 'Lisboa'),
	row('3', '7', 'Lisboa'),
	row('4', '8', 'Arroios'),
];

const locality = row('99', 'locality', 'Anjos');

describe('resolveLocation', () => {
	it('maps PT admin levels onto slots and keeps the neighbourhood', () => {
		const location = resolveLocation(lisbon, locality, [38.72, -9.13]);
		assert.deepEqual(location, {
			country: { admin_level: '2', name: 'Portugal', osm_id: 295480 },
			neighbourhood: { admin_level: 'locality', name: 'Anjos', osm_id: 99 },
			primary: { admin_level: '6', name: 'Lisboa', osm_id: 2 },
			secondary: { admin_level: '7', name: 'Lisboa', osm_id: 3 },
			tertiary: { admin_level: '8', name: 'Arroios', osm_id: 4 },
		});
	});

	it('omits the neighbourhood when no locality is near', () => {
		assert.equal('neighbourhood' in resolveLocation(lisbon, null, [0, 0]), false);
	});

	it('uses the country-specific levels (ES: 2 / 4 / 6 / 8)', () => {
		const madrid = [
			row('1311341', '2', 'España', { 'ISO3166-1': 'ES' }),
			row('10', '4', 'Comunidad de Madrid'),
			row('11', '6', 'Madrid'),
			row('12', '8', 'Madrid'),
		];
		const location = resolveLocation(madrid, null, [40.4, -3.7]);
		assert.equal(location.primary.name, 'Comunidad de Madrid');
		assert.equal(location.secondary.osm_id, 11);
	});

	it('throws when a required slot is missing or the country is unsupported', () => {
		assert.throws(() => resolveLocation(lisbon.filter(r => r.admin_level !== '8'), null, [0, 0]), /No tertiary division/);
		assert.throws(() => resolveLocation([row('1', '2', 'France', { 'ISO3166-1': 'FR' })], null, [0, 0]), /Unsupported country "FR"/);
	});
});
