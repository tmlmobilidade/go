/* * */

import { getDistanceBetweenPositions } from '@/geojson/measure-distances.js';
import { projectPointToSegment } from '@/geojson/project-point-to-segment.js';
import { type Feature, type LineString, type Point, type Position } from 'geojson';

/* * */

export function nearestPointOnLine(line: Feature<LineString>, point: Feature<Point>): Feature<Point> {
	const coords = line.geometry.coordinates;
	const [px, py] = point.geometry.coordinates;

	let closestPoint: Position = coords[0];
	let minDistance = Infinity;

	for (let i = 0; i < coords.length - 1; i++) {
		const a = coords[i];
		const b = coords[i + 1];
		const candidate = projectPointToSegment(a, b, [px, py]);
		const dist = getDistanceBetweenPositions(candidate, [px, py]);

		if (dist < minDistance) {
			minDistance = dist;
			closestPoint = candidate;
		}
	}

	return {
		geometry: {
			coordinates: closestPoint,
			type: 'Point',
		},
		properties: {
			distance: minDistance,
		},
		type: 'Feature',
	};
}
