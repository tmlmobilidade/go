import { type RoutePlannerLocation } from '@/types/route-planner/models';
import { rankMotisLocations } from '@/utils/search/rank-motis-locations';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

function place(label: string, category: string): RoutePlannerLocation {
	return { category, detail: 'Lisboa', id: `${category}:${label}`, label, type: 'PLACE' };
}

const aldi = place('ALDI PRÍNCIPE REAL', 'recycling_16');
const hotel = place('1869 Principe Real', 'hotel_16');
const garden = place('Jardim do Príncipe Real', 'none');

describe('MOTIS place ranking', () => {
	it('removes repeated OSM IDs before limiting visible results', () => {
		const azambuja = { ...place('Azambuja', 'place_capital_8'), id: 'node/[25611745]' };
		const azambujeira = { ...place('Azambujeira', 'place_capital_8'), id: 'node/[another-node]' };
		const locations = [azambuja, { ...azambuja }, azambujeira];
		const before = structuredClone(locations);

		assert.deepEqual(rankMotisLocations(locations, 'azamb').slice(0, 2), [azambuja, azambujeira]);
		assert.deepEqual(locations, before);
	});

	it('keeps the best matching alias for an OSM entity', () => {
		const firstAlias = { ...place('Aeródromo da Azambuja', 'none'), id: 'way/[1393953339]' };
		const exactAlias = { ...place('Campo de Voo da Azambuja', 'none'), id: firstAlias.id };

		assert.deepEqual(rankMotisLocations([firstAlias, exactAlias], 'campo de voo da azambuja'), [exactAlias]);
	});

	it('keeps distinct entities that share a name', () => {
		const first = { ...place('Azambuja', 'place_capital_8'), id: 'node/[first]' };
		const second = { ...first, id: 'node/[second]' };

		assert.deepEqual(rankMotisLocations([first, second], 'azambuja'), [first, second]);
	});

	it('promotes the main public place from beyond the initial ten suggestions', () => {
		const businesses = Array.from({ length: 12 }, (_, i) => place(`Loja ${i} Príncipe Real`, 'shop_16'));
		const locations = [aldi, ...businesses, garden];
		const before = [...locations];

		assert.equal(rankMotisLocations(locations, 'principe real')[0], garden);
		assert.deepEqual(locations, before);
	});

	it('keeps a specifically requested business ahead of public places', () => {
		assert.deepEqual(rankMotisLocations([garden, hotel, aldi], 'ALDI príncipe real'), [aldi, garden, hotel]);
	});

	it('prefers matching localities to businesses but does not boost unrelated localities', () => {
		const locality = place('Príncipe Real', 'neighbourhood');
		const unrelated = place('Lisboa', 'place_6');

		assert.deepEqual(rankMotisLocations([aldi, unrelated, garden, locality], 'príncipe real'), [locality, garden, aldi, unrelated]);
	});

	it('preserves upstream proximity order for equally relevant businesses', () => {
		assert.deepEqual(rankMotisLocations([hotel, aldi], 'principe real'), [hotel, aldi]);
	});

	it('does not promote businesses named after a public space', () => {
		const restaurant = place('Jardim do Príncipe Real', 'restaurant_14');

		assert.deepEqual(rankMotisLocations([restaurant, garden], 'principe real'), [garden, restaurant]);
	});

	it('preserves fuzzy suggestions when no names match the query tokens', () => {
		const fuzzy = [place('Mata', 'place_8'), place('Matiz', 'restaurant_14')];

		assert.deepEqual(rankMotisLocations(fuzzy, 'maat'), fuzzy);
	});
});
