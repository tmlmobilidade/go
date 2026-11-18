/* * */

import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { distance } from '@turf/turf';

/* * */

const STOPS_COORDINATES_RADIUS_METERS = 100;

// Allow floating point rounding at the 100 m boundary.
const DISTANCE_TOLERANCE_METERS = 1e-5;

/* * */

/**
 * Keeps permitted stops at or within the fixed 100 m coordinate search radius.
 * @param stops The stops already narrowed by the extraction filters and permissions.
 * @param coordinates The search centre in GeoJSON order [longitude, latitude].
 * @returns Matching stops, or the original result set when no centre is supplied.
 */
export function filterStopsByCoordinatesRadius<TStop extends Pick<Stop, 'latitude' | 'longitude'>>(stops: TStop[], coordinates?: [longitude: number, latitude: number]): TStop[] {
	//

	//
	// Preserve the permitted results when no coordinate filter is set

	if (!coordinates) return stops;

	//
	// Keep stops within the radius, including the boundary

	return stops.filter((stop) => {
		if (!Number.isFinite(stop.latitude) || !Number.isFinite(stop.longitude)) return false;

		const distanceMeters = distance(coordinates, [stop.longitude, stop.latitude], { units: 'meters' });
		return distanceMeters <= STOPS_COORDINATES_RADIUS_METERS + DISTANCE_TOLERANCE_METERS;
	});
}
