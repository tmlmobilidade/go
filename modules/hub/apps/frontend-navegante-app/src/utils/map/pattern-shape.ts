import { lineFeatureFromEncodedPolyline } from '@tmlmobilidade/geo';

/* * */

interface PatternShapeData {
	color: string
	shape_polyline?: string
	text_color: string
}

interface PatternShapeProperties {
	color: string
	text_color: string
}

/* * */

export function buildPatternShapeFeature(pattern: null | PatternShapeData | undefined): GeoJSON.Feature<GeoJSON.LineString, PatternShapeProperties> | null {
	if (!pattern?.shape_polyline) return null;

	const feature = lineFeatureFromEncodedPolyline(pattern.shape_polyline, {
		color: pattern.color,
		text_color: pattern.text_color,
	}, 6);

	if (feature.geometry.coordinates.length < 2) return null;
	if (feature.geometry.coordinates.some(coordinate => coordinate.some(value => !Number.isFinite(value)))) return null;

	return feature;
}
