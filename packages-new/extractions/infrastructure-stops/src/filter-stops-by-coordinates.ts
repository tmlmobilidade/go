/* * */

import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { distance } from '@turf/turf';

/** Applies the list's fixed 100 m radius after the extraction's permission filters. */
export function filterStopsByCoordinates<T extends Pick<Stop, 'latitude' | 'longitude'>>(stops: T[], coordinates?: [number, number]): T[] {
	if (!coordinates) return stops;
	return stops.filter((stop) => {
		if (!Number.isFinite(stop.latitude) || !Number.isFinite(stop.longitude)) return false;
		return distance(coordinates, [stop.longitude, stop.latitude], { units: 'meters' }) <= 100 + 1e-5;
	});
}
