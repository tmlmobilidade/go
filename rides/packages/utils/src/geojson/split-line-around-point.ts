/* * */

import { getDistanceBetweenPositions } from '@/geojson/measurements.js';
import { interpolatePositions } from '@/geojson/measurements.js';
import { projectPointToSegment } from '@/geojson/project-point-to-segment.js';
import { type Feature, type LineString, type Point, type Position } from 'geojson';

/* * */

export function splitLineAroundPoint(line: Feature<LineString>, point: Feature<Point>, metersBackward: number, metersForward: number): Feature<LineString> {
	const coords = line.geometry.coordinates;
	const pointCoords = point.geometry.coordinates;

	let foundIndex = -1;
	let projectionRatio = 0;

	for (let i = 0; i < coords.length - 1; i++) {
		const a = coords[i];
		const b = coords[i + 1];

		const segmentLength = getDistanceBetweenPositions(a, b);
		const projection = projectPointToSegment(a, b, pointCoords);
		const d1 = getDistanceBetweenPositions(a, projection);
		const d2 = getDistanceBetweenPositions(projection, b);

		// Check if projection lies between a and b (within a meter tolerance)
		const isOnSegment
      = Math.abs(getDistanceBetweenPositions(a, b) - (d1 + d2)) < 1;

		if (isOnSegment) {
			foundIndex = i;
			projectionRatio = d1 / segmentLength;
			break;
		}
	}

	if (foundIndex === -1) {
		throw new Error('Point not found on line');
	}

	const extractLine = (
		startIndex: number,
		targetDistance: number,
		forward = true,
	): Position[] => {
		const output: Position[] = [];
		let distanceWalked = 0;
		const step = forward ? 1 : -1;
		let i = startIndex;

		const start = interpolatePositions(
			coords[i],
			coords[i + 1],
			projectionRatio,
		);
		output.push(start);

		while (true) {
			const current = coords[i];
			const next = coords[i + step];
			if (!next) break;

			const segLength = getDistanceBetweenPositions(current, next);

			if (distanceWalked + segLength > targetDistance) {
				const remaining = targetDistance - distanceWalked;
				const ratio = remaining / segLength;
				const interpolated = interpolatePositions(current, next, forward ? ratio : 1 - ratio);
				output.push(interpolated);
				break;
			}

			output.push(forward ? next : current);
			distanceWalked += segLength;
			i += step;

			if (i < 0 || i >= coords.length - 1) break;
		}

		return forward ? output : output.reverse();
	};

	const backwardCoords = extractLine(foundIndex, metersBackward, false);
	const forwardCoords = extractLine(foundIndex, metersForward, true);

	// Remove the duplicate center point when merging
	const mergedCoords = [...backwardCoords, ...forwardCoords.slice(1)];

	return {
		geometry: {
			coordinates: mergedCoords,
			type: 'LineString',
		},
		properties: {},
		type: 'Feature',
	};
}
