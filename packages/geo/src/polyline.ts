/* * */

import polyline from '@mapbox/polyline';
import { type Feature, type GeoJsonProperties, type LineString } from 'geojson';

/* * */

export const DEFAULT_POLYLINE_PRECISION = 5;

/* * */

export function encodePolylineFromGeoJson(
	geojson: Feature<LineString> | LineString,
	precision: number = DEFAULT_POLYLINE_PRECISION,
): string {
	return polyline.fromGeoJSON(geojson, precision);
}

export function decodePolylineToGeoJson(
	encodedPolyline: string,
	precision: number = DEFAULT_POLYLINE_PRECISION,
): LineString {
	return polyline.toGeoJSON(encodedPolyline, precision) as LineString;
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
