/* * */

import { METERS_PER_DEGREE } from '@/geojson/constants.js';
import { type Position } from 'geojson';

/* * */

export function distanceBetweenCoords(a: Position, b: Position): number {
	const [lng1, lat1] = a;
	const [lng2, lat2] = b;

	const avgLat = (lat1 + lat2) / 2;
	const dx = (lng2 - lng1) * METERS_PER_DEGREE * Math.cos((avgLat * Math.PI) / 180);
	const dy = (lat2 - lat1) * METERS_PER_DEGREE;

	return Math.sqrt(dx * dx + dy * dy);
}
