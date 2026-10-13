import { type RoutePlannerLocation } from '@/types/route-planner/models';
import { normalizeSearchText } from '@/utils/search/normalize';

/* * */

const LOCALITY_CATEGORY = /^(?:place(?:_|$)|city$|town$|village$|hamlet$|suburb$|quarter$|neighbourhood$)/;
const PUBLIC_PLACE_CATEGORY = /^(?:park|garden|square|museum)(?:_|$)/;
const PUBLIC_PLACE_PREFIX = /^(?:jardim|parque|praca|largo|miradouro|museu|palacio)\s+(?:(?:de|do|da|dos|das)\s+)?/;

/** Rank unique places, preferring matching localities and public places while preserving MOTIS order within ties. */
export function rankMotisLocations(locations: RoutePlannerLocation[], query: string): RoutePlannerLocation[] {
	const normalizedQuery = normalizeName(query);
	const seenIds = new Set<string>();

	return locations
		.map(location => ({ location, score: normalizedQuery ? getLocationScore(location, normalizedQuery) : 0 }))
		.sort((a, b) => b.score - a.score)
		.map(result => result.location)
		.filter((location) => {
			// MOTIS can return duplicate suggestions or aliases for the same OSM entity.
			const id = location.id ?? location.label;
			if (seenIds.has(id)) return false;
			seenIds.add(id);
			return true;
		});
}

/* * */

function normalizeName(value: string) {
	return normalizeSearchText(value).replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function getLocationScore(location: RoutePlannerLocation, query: string) {
	const name = normalizeName(location.label);
	const tokens = name.split(' ');
	const queryTokens = query.split(' ');
	// A public-place boost must match every query token, so specific business searches still win.
	if (!queryTokens.every(token => tokens.some(nameToken => nameToken.startsWith(token)))) return 0;

	const category = location.category ?? '';
	const isLocality = LOCALITY_CATEGORY.test(category);
	// MOTIS sometimes exposes named gardens and squares with category "none".
	const isPublicPlace = PUBLIC_PLACE_CATEGORY.test(category) || (category === 'none' && PUBLIC_PLACE_PREFIX.test(name));
	const placePriority = isLocality ? 2 : isPublicPlace ? 1 : 0;
	const coreName = isPublicPlace ? name.replace(PUBLIC_PLACE_PREFIX, '') : name;
	const matchPriority = name === query || coreName === query ? 3 : name.startsWith(query) ? 2 : 1;

	return placePriority * 10 + matchPriority;
}
