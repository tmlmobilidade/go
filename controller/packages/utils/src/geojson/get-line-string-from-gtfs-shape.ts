/* * */

import { type HashedShape } from '@tmlmobilidade/types';
import { lineString } from '@turf/helpers';
import { type Feature, type LineString } from 'geojson';

/**
 * Converts a list of GTFS shape points into a GeoJSON LineString feature.
 * @param points Array of GTFS shape points
 * @returns GeoJSON LineString feature
 */
export function getLineStringFromGtfsShape(points: HashedShape['points']): Feature<LineString> {
	// Exit if no points are provided
	if (!points.length) throw new Error('GTFS shape is empty');
	// Sort points by shape_pt_sequence
	const sortedPoints = [...points].sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);
	// Create a LineString feature
	const coordinates = sortedPoints.map(p => [Number(p.shape_pt_lon), Number(p.shape_pt_lat)] as [number, number]);
	// Return the LineString feature
	return lineString(coordinates);
}
