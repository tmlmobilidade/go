import { formatMotisPlanDurationMinutes, getMotisItineraryActiveLegIndex, getMotisLegDurationSeconds, getMotisLegRemainingDistanceMeters, getMotisLegRemainingSeconds, type MotisItinerary, type MotisPlanLeg, type RoutePlannerLocation } from '@/utils/route-planner-motis';

/* * */

interface GetRoutePlannerActiveLegProgressOptions {
	destination: null | RoutePlannerLocation
	itinerary: MotisItinerary | null
	origin: null | RoutePlannerLocation
	userPosition: GeoJSON.Position | null
}

export interface RoutePlannerActiveLegProgress {
	activeLeg: MotisPlanLeg | null
	activeLegIndex: number
	isTrackingLocation: boolean
	remainingDistanceMeters: null | number
	remainingMinutes: null | number
}

/* * */

export function getRoutePlannerActiveLegProgress({ destination, itinerary, origin, userPosition }: GetRoutePlannerActiveLegProgressOptions): RoutePlannerActiveLegProgress {
	const legs = Array.isArray(itinerary?.legs) ? itinerary.legs : [];
	const activeLegIndex = itinerary && userPosition && legs.length > 0
		? getMotisItineraryActiveLegIndex(itinerary, userPosition, origin, destination)
		: 0;
	const activeLeg = legs[activeLegIndex] ?? legs[0] ?? null;

	if (!activeLeg) {
		return {
			activeLeg: null,
			activeLegIndex,
			isTrackingLocation: Boolean(userPosition),
			remainingDistanceMeters: null,
			remainingMinutes: null,
		};
	}

	const remainingSeconds = userPosition
		? getMotisLegRemainingSeconds(activeLeg, userPosition)
		: getMotisLegDurationSeconds(activeLeg);

	return {
		activeLeg,
		activeLegIndex,
		isTrackingLocation: Boolean(userPosition),
		remainingDistanceMeters: getMotisLegRemainingDistanceMeters(activeLeg, userPosition),
		remainingMinutes: formatMotisPlanDurationMinutes(remainingSeconds),
	};
}
