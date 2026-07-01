import { type Feature, type GeoJsonProperties, type LineString } from 'geojson';

/* * */

export const DEFAULT_POLYLINE_PRECISION = 5;

/* * */

function roundCoordinate(value: number): number {
	return Math.floor(Math.abs(value) + 0.5) * (value >= 0 ? 1 : -1);
}

function encodeCoordinate(current: number, previous: number, factor: number): string {
	let coordinate = (roundCoordinate(current * factor) - roundCoordinate(previous * factor)) * 2;
	if (coordinate < 0) coordinate = -coordinate - 1;

	let output = '';
	while (coordinate >= 0x20) {
		output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
		coordinate = Math.floor(coordinate / 32);
	}
	output += String.fromCharCode(coordinate + 63);

	return output;
}

function getPrecisionFactor(precision: number): number {
	return Math.pow(10, Number.isInteger(precision) ? precision : DEFAULT_POLYLINE_PRECISION);
}

function getLineString(geojson: Feature<LineString> | LineString): LineString {
	if (geojson.type === 'Feature') return geojson.geometry;
	return geojson;
}

function encodeLineString(lineString: LineString, precision: number): string {
	if (lineString.type !== 'LineString') throw new Error('Input must be a GeoJSON LineString');
	if (!lineString.coordinates.length) return '';

	const factor = getPrecisionFactor(precision);
	let previousLatitude = 0;
	let previousLongitude = 0;
	let output = '';

	for (const [longitude, latitude] of lineString.coordinates) {
		output += encodeCoordinate(latitude, previousLatitude, factor);
		output += encodeCoordinate(longitude, previousLongitude, factor);
		previousLatitude = latitude;
		previousLongitude = longitude;
	}

	return output;
}

/* * */

export function encodePolylineFromGeoJson(
	geojson: Feature<LineString> | LineString,
	precision: number = DEFAULT_POLYLINE_PRECISION,
): string {
	return encodeLineString(getLineString(geojson), precision);
}

export function decodePolylineToGeoJson(
	encodedPolyline: string,
	precision: number = DEFAULT_POLYLINE_PRECISION,
): LineString {
	const factor = getPrecisionFactor(precision);
	const coordinates: [number, number][] = [];

	let index = 0;
	let latitude = 0;
	let longitude = 0;

	while (index < encodedPolyline.length) {
		let byte = 0;
		let result = 0;
		let shift = 1;

		do {
			byte = encodedPolyline.charCodeAt(index++) - 63;
			result += (byte & 0x1f) * shift;
			shift *= 32;
		} while (byte >= 0x20);

		const latitudeChange = result & 1 ? (-result - 1) / 2 : result / 2;

		result = 0;
		shift = 1;

		do {
			byte = encodedPolyline.charCodeAt(index++) - 63;
			result += (byte & 0x1f) * shift;
			shift *= 32;
		} while (byte >= 0x20);

		const longitudeChange = result & 1 ? (-result - 1) / 2 : result / 2;

		latitude += latitudeChange;
		longitude += longitudeChange;

		coordinates.push([longitude / factor, latitude / factor]);
	}

	return {
		coordinates,
		type: 'LineString',
	};
}

export function lineFeatureFromEncodedPolyline<TProperties extends GeoJsonProperties = GeoJsonProperties>(
	encodedPolyline: string,
	properties?: TProperties,
	precision: number = DEFAULT_POLYLINE_PRECISION,
): Feature<LineString, TProperties> {
	return {
		geometry: decodePolylineToGeoJson(encodedPolyline, precision),
		properties: properties ?? ({} as TProperties),
		type: 'Feature',
	};
}

/* * */
