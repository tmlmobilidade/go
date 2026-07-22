import { getMotisItineraryDurationSeconds, getMotisItineraryWalkMinutes, getMotisLegModeKind, getMotisTransfersCount, isMotisWalkingLeg, type MotisItinerary } from '@/utils/route-planner-motis';

/* * */

export type RoutePlannerModeFilter = 'bus' | 'ferry' | 'rail' | 'subway' | 'tram' | 'transit';
export type RoutePlannerSortMode = 'best' | 'fastest' | 'fewer_transfers' | 'least_walking';

export interface RoutePlannerVisibleItinerary {
	index: number
	itinerary: MotisItinerary
}

/* * */

export function getItineraryTransitModeFilters(itinerary: MotisItinerary): RoutePlannerModeFilter[] {
	const legs = Array.isArray(itinerary.legs) ? itinerary.legs : [];
	const modes = legs
		.filter(leg => !isMotisWalkingLeg(leg))
		.map(leg => normalizeModeFilter(getMotisLegModeKind(leg)));

	return Array.from(new Set(modes));
}

export function itineraryMatchesEnabledModes(itinerary: MotisItinerary, enabledModes: Set<RoutePlannerModeFilter>) {
	const modes = getItineraryTransitModeFilters(itinerary);
	return modes.length === 0 || modes.every(mode => enabledModes.has(mode));
}

export function sortVisibleItineraries(itineraries: RoutePlannerVisibleItinerary[], sortMode: RoutePlannerSortMode) {
	const results = [...itineraries];

	if (sortMode === 'fastest') {
		return results.sort((a, b) => getMotisItineraryDurationSeconds(a.itinerary) - getMotisItineraryDurationSeconds(b.itinerary));
	}

	if (sortMode === 'fewer_transfers') {
		return results.sort((a, b) => getItineraryTransfersCount(a.itinerary) - getItineraryTransfersCount(b.itinerary));
	}

	if (sortMode === 'least_walking') {
		return results.sort((a, b) => getItineraryWalkMinutes(a.itinerary) - getItineraryWalkMinutes(b.itinerary));
	}

	return results;
}

export function toggleRoutePlannerMode(enabledModes: Set<RoutePlannerModeFilter>, mode: RoutePlannerModeFilter) {
	const nextEnabledModes = new Set(enabledModes);

	if (nextEnabledModes.has(mode)) nextEnabledModes.delete(mode);
	else nextEnabledModes.add(mode);

	return nextEnabledModes.size > 0 ? nextEnabledModes : enabledModes;
}

/* * */

function getItineraryTransfersCount(itinerary: MotisItinerary) {
	const legs = Array.isArray(itinerary.legs) ? itinerary.legs : [];
	return getMotisTransfersCount(itinerary.transfers, legs);
}

function getItineraryWalkMinutes(itinerary: MotisItinerary) {
	const legs = Array.isArray(itinerary.legs) ? itinerary.legs : [];
	return getMotisItineraryWalkMinutes(legs);
}

function normalizeModeFilter(mode: string): RoutePlannerModeFilter {
	if (mode === 'bus') return 'bus';
	if (mode === 'ferry') return 'ferry';
	if (mode === 'rail') return 'rail';
	if (mode === 'subway') return 'subway';
	if (mode === 'tram') return 'tram';
	return 'transit';
}
