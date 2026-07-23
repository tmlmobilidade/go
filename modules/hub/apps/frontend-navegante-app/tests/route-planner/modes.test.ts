import { type MotisPlanLeg } from '@/types/route-planner/models';
import { getMotisLegDisplayLabel, getMotisLegRouteLabel, getMotisModeKind } from '@/utils/route-planner/presentation/modes';
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

describe('MOTIS route labels', () => {
	it('keeps machine route labels separate from translated fallback labels', () => {
		const leg = { mode: 'RAIL' } as MotisPlanLeg;

		assert.equal(getMotisLegRouteLabel(leg), 'RAIL');
		assert.equal(getMotisLegDisplayLabel(leg, mode => mode === 'rail' ? 'Comboio' : mode), 'Comboio');
	});

	it('preserves an explicit route label for matching and display', () => {
		const leg = { mode: 'BUS', routeShortName: '728' } as MotisPlanLeg;

		assert.equal(getMotisLegRouteLabel(leg), '728');
		assert.equal(getMotisLegDisplayLabel(leg, mode => mode), '728');
	});
});
