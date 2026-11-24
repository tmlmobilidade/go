/* * */

import { decodePolylineToGeoJson, encodePolylineFromGeoJson, simplify } from '@tmlmobilidade/geo';
import { type Shape } from '@tmlmobilidade/go-types-offer';

/* * */

// Turf uses coordinate units: 0.0001 degrees is approximately 8–11 metres in Portugal.
const OVERVIEW_SIMPLIFICATION_TOLERANCE = 0.0001;

/** Simplify a decoded copy for display, preserving the original encoded shape. */
export function simplifyPatternOverviewShape(encodedPolyline: string): string {
	const geometry = decodePolylineToGeoJson(encodedPolyline);
	if (geometry.coordinates.length <= 2) return encodedPolyline;

	const simplified = simplify(geometry, {
		highQuality: true,
		mutate: true,
		tolerance: OVERVIEW_SIMPLIFICATION_TOLERANCE,
	});

	return encodePolylineFromGeoJson(simplified);
}

/** Refresh derived geometry from the original when a shape is saved or imported. */
export function withSimplifiedPatternShape(shape: Shape): Shape {
	const encodedPolyline = shape.encoded_polyline ?? encodePolylineFromGeoJson(shape.geojson.geometry);
	return {
		...shape,
		encoded_polyline: encodedPolyline,
		encoded_polyline_simplified: simplifyPatternOverviewShape(encodedPolyline),
	};
}
