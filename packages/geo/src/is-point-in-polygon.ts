/* * */

import { type Feature, type Point, type Polygon, type Position } from 'geojson';

/**
 * Check if a point is inside a polygon using the ray-casting algorithm.
 * @param point A GeoJSON Point representation of the point to check.
 * @param geofence A GeoJSON Polygon representation of the geofence.
 * @returns A boolean indicating if the point is inside the polygon.
 * @see https://en.wikipedia.org/wiki/Point_in_polygon#Ray_casting_algorithm
 */
export function isPointInPolygon(point: Feature<Point> | Position, polygon: Feature<Polygon>): boolean {
	//

	const pt: Position = Array.isArray(point) ? point : point.geometry.coordinates;
	const [x, y] = pt;

	const ring = polygon.geometry.coordinates[0]; // Outer ring only
	let inside = false;

	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const xi = ring[i][0], yi = ring[i][1];
		const xj = ring[j][0], yj = ring[j][1];

		const intersectsVertically = (yi > y) !== (yj > y);
		const edgeSlope = (xj - xi) / (yj - yi + 1e-10); // slope of the edge
		const xIntersect = edgeSlope * (y - yi) + xi;
		const isToRight = x < xIntersect;

		const intersects = intersectsVertically && isToRight;

		if (intersects) inside = !inside;
	}

	return inside;
}

// /**
//  * Check if a point is inside a geofence polygon.
//  * @param point A GeoJSON Point representation of the point to check.
//  * @param geofence A GeoJSON Polygon representation of the geofence.
//  * @returns A boolean indicating if the point is inside the geofence polygon.
//  */
// export function isInsideGeofence(point: Position, geofence: Feature<Polygon>): boolean {
// 	// Check if the point is inside the polygon
// 	return isPointInPolygon(point, geofence);
// }
