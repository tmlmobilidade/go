import { getMotisModeKind } from '@/utils/route-planner/modes';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('getMotisModeKind', () => {
	it('normalizes MOTIS mode variants for route presentation', () => {
		const expectedModes = new Map([
			['AIRPLANE', 'plane'],
			['BICYCLE', 'bike'],
			['BIKE', 'bike'],
			['BOAT', 'ferry'],
			['BUS', 'bus'],
			['CAR', 'car'],
			['DEBUG_BUS_ROUTE', 'bus'],
			['ELEVATOR', 'elevator'],
			['FERRY', 'ferry'],
			['FOOT', 'walk'],
			['LIGHT_RAIL', 'tram'],
			['METRO', 'subway'],
			['RAIL', 'rail'],
			['SCOOTER', 'scooter'],
			['SUBWAY', 'subway'],
			['TAXI', 'car'],
			['TRAIN', 'rail'],
			['TRAM', 'tram'],
			['TRANSIT', 'transit'],
			['WALK', 'walk'],
		]);

		for (const [mode, expectedModeKind] of expectedModes) {
			assert.equal(getMotisModeKind(mode), expectedModeKind);
		}
	});

	it('uses the generic transit presentation for unknown modes', () => {
		assert.equal(getMotisModeKind('OTHER'), 'transit');
	});
});
