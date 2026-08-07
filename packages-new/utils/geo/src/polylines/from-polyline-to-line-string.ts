/* * */

import { type EncodedPolyline, type GeoJsonLineStringGeometry, GeoJsonLineStringGeometrySchema, parseEncodedPolyline } from '@tmlmobilidade/go-types-geo';

/**
 * Decode a polyline from an encoded string into a GeoJSON LineString.
 * @param encoded The encoded polyline to decode.
 * @param onPoint A callback function that receives the latitude
 * and longitude values for each decoded coordinate.
 * @throws An error if the input is malformed.
 */
export function fromEncodedPolylineToGeoJsonLineString(value: EncodedPolyline): GeoJsonLineStringGeometry {
	// Initialize the coordinates array.
	const result: GeoJsonLineStringGeometry = { coordinates: [], type: 'LineString' };
	// Parse the encoded polyline.
	parseEncodedPolyline(value, (decodedLatitude, decodedLongitude) => {
		result.coordinates.push([decodedLongitude, decodedLatitude]);
	});
	// Return the decoded polyline.
	return GeoJsonLineStringGeometrySchema.parse(result);
}
