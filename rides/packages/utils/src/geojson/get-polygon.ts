/* * */

import { type Feature, type Polygon, type Position } from 'geojson';

/**
 * Creates a new Polygon feature from the given coordinates.
 * @param coords An array of coordinates for the Polygon. Defaults to an empty array.
 * @returns A GeoJSON Polygon feature with the specified coordinates.
 */
export function getPolygon(coords: Position[][] = []): Feature<Polygon> {
	return {
		geometry: {
			coordinates: coords,
			type: 'Polygon',
		},
		properties: {},
		type: 'Feature',
	};
}
