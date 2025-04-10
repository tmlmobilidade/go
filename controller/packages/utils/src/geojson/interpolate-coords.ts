/* * */

import { type Position } from 'geojson';

/* * */

export function interpolateCoords(a: Position, b: Position, t: number): Position {
	const lng = a[0] + (b[0] - a[0]) * t;
	const lat = a[1] + (b[1] - a[1]) * t;
	return [lng, lat];
}
