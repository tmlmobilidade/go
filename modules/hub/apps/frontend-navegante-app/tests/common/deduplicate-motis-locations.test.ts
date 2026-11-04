import { type RoutePlannerLocation } from '@/types/route-planner/models';
import { deduplicateMotisLocations } from '@/utils/search/deduplicate-motis-locations';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

function place(id: string, label: string): RoutePlannerLocation {
	return { detail: 'Lisboa', id, label, type: 'PLACE' };
}

describe('MOTIS place deduplication', () => {
	it('keeps MOTIS order, including a place ahead of matching roads', () => {
		const placeResult = place('way/[place]', 'Área Metropolitana de Lisboa');
		const road = place('way/[road]', 'Via de Cintura da Área Metropolitana de Lisboa');

		assert.deepEqual(deduplicateMotisLocations([placeResult, road]), [placeResult, road]);
	});

	it('keeps the first suggestion for each OSM ID and leaves the input unchanged', () => {
		const first = place('node/[25611745]', 'Azambuja');
		const alias = place('node/[25611745]', 'Azambuja (alias)');
		const second = place('node/[second]', 'Azambujeira');
		const locations = [first, alias, second];

		assert.deepEqual(deduplicateMotisLocations(locations), [first, second]);
		assert.deepEqual(locations, [first, alias, second]);
	});

	it('keeps distinct OSM entities with the same name', () => {
		const first = place('node/[first]', 'Azambuja');
		const second = place('node/[second]', 'Azambuja');

		assert.deepEqual(deduplicateMotisLocations([first, second]), [first, second]);
	});
});
