import { findVehicleLine, getVehiclePatternId } from '@/utils/transit/vehicle-detail';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('vehicle detail data resolution', () => {
	it('uses the exact pattern reported by the vehicle', () => {
		assert.equal(getVehiclePatternId({
			pattern_id: '[BNA17]2336_0_3',
		}), '[BNA17]2336_0_3');
	});

	it('does not invent a pattern when realtime data has no match', () => {
		assert.equal(getVehiclePatternId({ pattern_id: null }), null);
		assert.equal(getVehiclePatternId(null), null);
	});

	it('matches a line by its qualified route ID', () => {
		const line = findVehicleLine({
			agency_id: 'BNA17',
			route_id: '[BNA17]2336_0',
			route_short_name: '2336',
		}, [
			{ agency_id: 'OTHER', route_ids: ['[OTHER]2336_0'], short_name: '2336' },
			{ agency_id: 'BNA17', route_ids: ['[BNA17]2336_0'], short_name: '2336' },
		]);

		assert.equal(line?.agency_id, 'BNA17');
	});

	it('falls back to an agency-scoped short name', () => {
		const line = findVehicleLine({
			agency_id: 'BNA17',
			route_id: '[BNA17]missing',
			route_short_name: '2336',
		}, [
			{ agency_id: 'OTHER', route_ids: [], short_name: '2336' },
			{ agency_id: 'BNA17', route_ids: [], short_name: '2336' },
		]);

		assert.equal(line?.agency_id, 'BNA17');
	});
});
