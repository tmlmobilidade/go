/* * */

/**
 * Decodes Valhalla encoded polyline.
 *
 * Returns GeoJSON-ready coordinates:
 * [lon, lat]
 */
export function decodeValhallaShape(encoded: string): [number, number][] {
	let index = 0;
	let lat = 0;
	let lon = 0;

	const coordinates: [number, number][] = [];

	while (index < encoded.length) {
		let result = 0;
		let shift = 0;
		let byte: number;

		do {
			byte = encoded.charCodeAt(index++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);

		const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
		lat += deltaLat;

		result = 0;
		shift = 0;

		do {
			byte = encoded.charCodeAt(index++) - 63;
			result |= (byte & 0x1f) << shift;
			shift += 5;
		} while (byte >= 0x20);

		const deltaLon = result & 1 ? ~(result >> 1) : result >> 1;
		lon += deltaLon;

		coordinates.push([
			lon / 1e6,
			lat / 1e6,
		]);
	}

	return coordinates;
}
