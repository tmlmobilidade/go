/* * */

import { type Position } from 'geojson';

/* * */

export function projectPointToSegment(a: Position, b: Position, p: Position): Position {
	const [x1, y1] = a;
	const [x2, y2] = b;
	const [x3, y3] = p;

	const dx = x2 - x1;
	const dy = y2 - y1;
	const lengthSquared = dx * dx + dy * dy;

	if (lengthSquared === 0) return a; // segment is a point

	let t = ((x3 - x1) * dx + (y3 - y1) * dy) / lengthSquared;
	t = Math.max(0, Math.min(1, t)); // clamp between 0 and 1

	return [x1 + t * dx, y1 + t * dy];
}
