/* * */

/**
 * Builds a MongoDB geo-intersects filter for a latitude/longitude point.
 * @param lat - Latitude of the point.
 * @param lon - Longitude of the point.
 * @returns A filter matching documents whose geometry contains the point.
 */
export function geoFilter(lat: number, lon: number) {
	return { geometry: { $geoIntersects: { $geometry: { coordinates: [lon, lat], type: 'Point' } } } };
}
