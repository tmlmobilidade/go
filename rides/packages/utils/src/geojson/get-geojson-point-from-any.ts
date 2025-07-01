/* * */

import { feature, point } from '@turf/helpers';
import { type Feature, type Point, type Position } from 'geojson';

/* * */

export function getGeoJsonPointFromAny(input: Feature<Point> | Point | Position): Feature<Point> {
	// If the input is a Position
	if (Array.isArray(input) && input.length === 2) {
		return point(input) as Feature<Point>;
	}
	// If the input is a Point
	if (!Array.isArray(input) && input.type === 'Point') {
		return feature(input);
	}
	// If the input is a Feature<Point>
	if (!Array.isArray(input) && input.type === 'Feature' && input.geometry.type === 'Point') {
		return input;
	}
	// Throw if invalid input type
	throw new Error('Invalid input type');
}
