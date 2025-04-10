/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* * */

import { METERS_PER_DEGREE } from '@/geojson/constants.js';
import { distanceBetweenCoords } from '@/geojson/distance-between-coords.js';
import { getPolygon } from '@/geojson/get-polygon.js';
import { type Feature, type LineString, type Polygon, Position } from 'geojson';

/**
 * Creates a fast approximate buffer around a LineString by offsetting segments to both sides.
 * This is a simplified approach, not suitable for high-precision or large-scale coordinates.
 * This version avoids unnecessary point creation.
 * @param line A GeoJSON LineString feature representing the path.
 * @param radius The buffer distance in meters. Default is 50 meters.
 * @param tolerance The tolerance for simplification. Default is 1 meter.
 * @returns A GeoJSON Polygon feature representing the tube-like buffer around the line.
 */
export function getGeofenceOnLine(line: Feature<LineString>, radius = 50, tolerance = 10): Feature<Polygon> {
	// Extract the coordinates from the LineString
	const lineCoordinates = line.geometry.coordinates;
	// Exit if the line has less than 2 points
	if (lineCoordinates.length < 2) return getPolygon();
	// Initialize arrays to hold the offset points
	const leftOffsetPoints: [number, number][] = [];
	const rightOffsetPoints: [number, number][] = [];
	// Loop through each segment of the line
	// to calculate offset points for both sides
	for (let i = 0; i < lineCoordinates.length - 1; i++) {
		// Get the coordinates of the current and next point
		const [lngStart, latStart] = lineCoordinates[i];
		const [lngEnd, latEnd] = lineCoordinates[i + 1];
		// Calculate the differences in longitude and latitude between the two points
		const deltaLng = lngEnd - lngStart;
		const deltaLat = latEnd - latStart;
		// Calculate the average latitude and convert degrees to radians
		const averageLatitude = (latStart + latEnd) / 2;
		const metersPerDegreeLng = METERS_PER_DEGREE * Math.cos((averageLatitude * Math.PI) / 180);
		const metersPerDegreeLat = METERS_PER_DEGREE;
		// Calculate the perpendicular (normal) vector to the segment
		const segmentLength = Math.sqrt(deltaLng * deltaLng + deltaLat * deltaLat);
		const unitNormalX = -deltaLat / segmentLength;
		const unitNormalY = deltaLng / segmentLength;
		// Calculate the offsets in longitude and latitude using
		// the meters per degree conversion and the radius of the buffer
		const offsetLng = (unitNormalX * radius) / metersPerDegreeLng;
		const offsetLat = (unitNormalY * radius) / metersPerDegreeLat;
		// Skip unnecessary points based on tolerance
		// if (i > 0) {
		// 	const prevPoint = lineCoordinates[i - 1];
		// 	const dist = distanceBetweenCoords(prevPoint, [lngStart, latStart]);
		// 	if (dist <= tolerance) continue; // Skip if the point is too close to the previous one
		// }
		// Push offset coordinates for left and right sides of the line
		leftOffsetPoints.push([lngStart + offsetLng, latStart + offsetLat]);
		rightOffsetPoints.push([lngStart - offsetLng, latStart - offsetLat]);
		// For the last segment (last 2 points),
		// add the end point with the same offsets
		if (i === lineCoordinates.length - 2) {
			leftOffsetPoints.push([lngEnd + offsetLng, latEnd + offsetLat]);
			rightOffsetPoints.push([lngEnd - offsetLng, latEnd - offsetLat]);
		}
	}
	// Close the polygon ring by combining left and reversed right side
	const polygonRing: [number, number][] = [
		...leftOffsetPoints,
		...rightOffsetPoints.reverse(),
		leftOffsetPoints[0], // close the ring
	];
	// Return the polygon feature
	const poly: Polygon = {
		coordinates: [polygonRing],
		type: 'Polygon',
	};
	const result = mergePolygonsCleanly([poly], tolerance);
	return getPolygon(result.coordinates);
}

/* * */

function subtract(a: Position, b: Position): Position {
	return [a[0] - b[0], a[1] - b[1]];
}

function add(a: Position, b: Position): Position {
	return [a[0] + b[0], a[1] + b[1]];
}

function normalize(v: Position): Position {
	const len = Math.hypot(v[0], v[1]);
	return len === 0 ? [0, 0] : [v[0] / len, v[1] / len];
}

function perpendicular(v: Position): Position {
	return [-v[1], v[0]]; // Left-hand perpendicular
}

function scale(v: Position, factor: number): Position {
	return [v[0] * factor, v[1] * factor];
}

function angleBetween(a: Position, b: Position): number {
	return Math.atan2(b[1] - a[1], b[0] - a[0]);
}

function arcPoints(center: Position, startAngle: number, endAngle: number, radius: number, steps = 8): Position[] {
	const points: Position[] = [];
	const step = (endAngle - startAngle) / steps;
	for (let i = 0; i <= steps; i++) {
		const angle = startAngle + i * step;
		points.push([
			center[0] + Math.cos(angle) * radius,
			center[1] + Math.sin(angle) * radius,
		]);
	}
	return points;
}

/* * */

function offsetLineString(line: Position[], distance: number): Position[] {
	const left: Position[] = [];
	const right: Position[] = [];

	for (let i = 0; i < line.length - 1; i++) {
		const p1 = line[i];
		const p2 = line[i + 1];
		const dir = normalize(subtract(p2, p1));
		const normal = perpendicular(dir);

		const offset = scale(normal, distance);

		left.push(add(p1, offset));
		right.push(add(p2, scale(normal, -distance))); // mirrored for other side
	}

	return [...left, ...right.reverse()];
}

/* * */

function addCaps(line: Position[], distance: number): Position[] {
	const start = line[0];
	const end = line[line.length - 1];

	const startDir = normalize(subtract(line[1], start));
	const endDir = normalize(subtract(end, line[line.length - 2]));

	const startAngle = Math.atan2(startDir[1], startDir[0]) + Math.PI / 2;
	const endAngle = Math.atan2(endDir[1], endDir[0]) - Math.PI / 2;

	const startCap = arcPoints(start, startAngle, startAngle + Math.PI, distance);
	const endCap = arcPoints(end, endAngle, endAngle + Math.PI, distance);

	return [...startCap, ...endCap.reverse()];
}

/* * */

export function generateBufferPolygon(line: Position[], distance: number): Position[] {
	const offset = offsetLineString(line, distance);
	// const caps = addCaps(line, distance);

	// const polygon = [...offset, ...caps];
	const polygon = [...offset];

	// Remove inner overlaps: rough simplification by convex hull or similar is optional
	return polygon;
}

/* * */

function mergePolygons(polygons: Polygon[]): Polygon {
	// Flatten all rings from all polygons
	const allRings: Position[][] = [];

	for (const poly of polygons) {
		if (poly.type === 'Polygon') {
			allRings.push(...poly.coordinates);
		}
		// else if (poly.type === 'MultiPolygon') {
		// 	for (const p of poly.coordinates) {
		// 		allRings.push(...p);
		// 	}
		// }
	}

	// Flatten all points into a giant set of raw coordinates
	const allPoints: Position[] = allRings.flat();

	// Deduplicate points and remove near-duplicates
	const precision = 1e-6;
	const key = (p: Position) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;
	const seen = new Set<string>();
	const cleanedPoints = allPoints.filter((p) => {
		const k = key(p);
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});

	// Very naive convex hull as an outer boundary approximation
	// (better than keeping all points which may be noisy)
	const hull = convexHull(cleanedPoints);

	return {
		coordinates: [hull],
		type: 'Polygon',
	};
}

/* * */

function convexHull(points: Position[]): Position[] {
	if (points.length < 3) return points;

	const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

	const cross = (o: Position, a: Position, b: Position) =>
		(a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

	const lower: Position[] = [];
	for (const p of sorted) {
		while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
			lower.pop();
		}
		lower.push(p);
	}

	const upper: Position[] = [];
	for (let i = sorted.length - 1; i >= 0; i--) {
		const p = sorted[i];
		while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
			upper.pop();
		}
		upper.push(p);
	}

	// Concatenate lower and upper without duplicate end points
	lower.pop();
	upper.pop();
	return [...lower, ...upper, lower[0]];
}

/* * */

function samePoint(a: Position, b: Position): boolean {
	return Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;
}

function normalizeEdge(a: Position, b: Position): string {
	return JSON.stringify([a, b].sort((p1, p2) =>
		p1[0] !== p2[0] ? p1[0] - p2[0] : p1[1] - p2[1],
	));
}

/* * */

interface Edge {
	coords: [Position, Position]
	count: number
}

function extractEdges(polygons: Polygon[]): Map<string, Edge> {
	const edgeMap = new Map<string, Edge>();
	for (const poly of polygons) {
		for (const ring of poly.coordinates) {
			for (let i = 0; i < ring.length - 1; i++) {
				const edge: [Position, Position] = [ring[i], ring[i + 1]];
				const key = normalizeEdge(edge[0], edge[1]);
				const existing = edgeMap.get(key);
				if (existing) {
					existing.count += 1;
				}
				else {
					edgeMap.set(key, {
						coords: edge,
						count: 1,
					});
				}
			}
		}
	}

	return edgeMap;
}

function getExteriorEdges(edgeMap: Map<string, Edge>): [Position, Position][] {
	const edges: [Position, Position][] = [];
	for (const e of edgeMap.values()) {
		if (e.count === 1) edges.push([e.coords[0], e.coords[1]]);
	}
	return edges;
}

function buildRing(edges: [Position, Position][]): Position[] {
	if (edges.length === 0) return [];

	const ring: Position[] = [];
	const edgeList = [...edges];
	const e = edgeList.shift()!;
	ring.push(e[0], e[1]);

	while (edgeList.length > 0) {
		const last = ring[ring.length - 1];
		const i = edgeList.findIndex(e => samePoint(e[0], last) || samePoint(e[1], last));
		if (i === -1) break;

		const e = edgeList.splice(i, 1)[0];
		const nextPoint = samePoint(e[0], last) ? e[1] : e[0];
		ring.push(nextPoint);
	}

	// Close ring
	if (!samePoint(ring[0], ring[ring.length - 1])) {
		ring.push(ring[0]);
	}

	return ring;
}

function simplifyRDP(points: Position[], tolerance: number): Position[] {
	if (points.length < 3) return points;

	const sq = (x: number) => x * x;
	const distToSegmentSq = (p: Position, [a, b]: [Position, Position]): number => {
		const [x, y] = p;
		const [x1, y1] = a;
		const [x2, y2] = b;

		const dx = x2 - x1;
		const dy = y2 - y1;

		if (dx === 0 && dy === 0) return sq(x - x1) + sq(y - y1);

		const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
		const clampedT = Math.max(0, Math.min(1, t));
		const projX = x1 + clampedT * dx;
		const projY = y1 + clampedT * dy;

		return sq(x - projX) + sq(y - projY);
	};

	const maxSqDist = (points: Position[], start: number, end: number): [number, number] => {
		let maxDist = 0;
		let index = -1;

		for (let i = start + 1; i < end; i++) {
			const d = distToSegmentSq(points[i], [points[start], points[end]]);
			if (d > maxDist) {
				maxDist = d;
				index = i;
			}
		}

		return [maxDist, index];
	};

	function rdp(start: number, end: number): Position[] {
		const [maxDist, index] = maxSqDist(points, start, end);
		if (maxDist > tolerance * tolerance && index !== -1) {
			return [...rdp(start, index), ...rdp(index, end).slice(1)];
		}
		else {
			return [points[start], points[end]];
		}
	}

	return rdp(0, points.length - 1);
}

export function mergePolygonsCleanly(polygons: Polygon[], detail = 0.5): Polygon {
	const edges = extractEdges(polygons);
	const exterior = getExteriorEdges(edges);
	let ring = buildRing(exterior);

	if (detail > 0) {
		ring = simplifyRDP(ring, detail);
	}

	return {
		coordinates: [ring],
		type: 'Polygon',
	};
}
