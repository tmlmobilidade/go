/* * */

import { type Feature, type LineString, type Position } from 'geojson';

/**
 * Creates a new LineString feature from the given coordinates.
 * @param coords An array of coordinates for the LineString. Defaults to an empty array.
 * @returns A GeoJSON LineString feature with the specified coordinates.
 */
export function getLineString(coords: Position[] = []): Feature<LineString> {
	return {
		geometry: {
			coordinates: coords,
			type: 'LineString',
		},
		properties: {},
		type: 'Feature',
	};
}
