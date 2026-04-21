/* * */

import type { GridPosition, Vehicle } from './types';

/* * */

/**
 * Converts latitude/longitude coordinates to grid positions within the canvas bounds
 */
export function vehiclesToGridPositions(
	vehicles: Vehicle[],
	width: number,
	height: number,
	padding: number = 20,
): GridPosition[] {
	if (vehicles.length === 0) return [];

	// Find bounds of all vehicles
	let minLat = Infinity;
	let maxLat = -Infinity;
	let minLon = Infinity;
	let maxLon = -Infinity;

	for (const vehicle of vehicles) {
		if (vehicle.lat < minLat) minLat = vehicle.lat;
		if (vehicle.lat > maxLat) maxLat = vehicle.lat;
		if (vehicle.lon < minLon) minLon = vehicle.lon;
		if (vehicle.lon > maxLon) maxLon = vehicle.lon;
	}

	const latRange = maxLat - minLat || 1;
	const lonRange = maxLon - minLon || 1;

	// Available space after padding
	const availableWidth = width - padding * 2;
	const availableHeight = height - padding * 2;

	// Maintain aspect ratio
	const latScale = availableHeight / latRange;
	const lonScale = availableWidth / lonRange;
	const scale = Math.min(latScale, lonScale);

	// Center offset
	const scaledWidth = lonRange * scale;
	const scaledHeight = latRange * scale;
	const offsetX = (width - scaledWidth) / 2;
	const offsetY = (height - scaledHeight) / 2;

	return vehicles.map((vehicle): GridPosition => ({
		bearing: vehicle.bearing ?? 0,
		id: vehicle.id,
		timestamp: vehicle.timestamp,
		tripId: vehicle.trip_id,
		// Longitude maps to X
		x: offsetX + (vehicle.lon - minLon) * scale,
		// Latitude maps to Y (inverted because Y increases downward in canvas)
		y: offsetY + (maxLat - vehicle.lat) * scale,
	}));
}

/* * */

/**
 * Finds the closest neighbor for each position using Euclidean distance
 */
export function findClosestNeighbors(
	positions: GridPosition[],
): Map<string, string> {
	const neighbors = new Map<string, string>();

	for (const position of positions) {
		let minDistance = Infinity;
		let closestId: null | string = null;

		for (const other of positions) {
			if (position.id === other.id) continue;

			const dx = position.x - other.x;
			const dy = position.y - other.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < minDistance) {
				minDistance = distance;
				closestId = other.id;
			}
		}

		if (closestId) {
			neighbors.set(position.id, closestId);
		}
	}

	return neighbors;
}

/* * */

/**
 * Finds the farthest neighbor for each position using Euclidean distance
 */
export function findFarthestNeighbors(
	positions: GridPosition[],
): Map<string, string> {
	const neighbors = new Map<string, string>();

	for (const position of positions) {
		let maxDistance = -Infinity;
		let farthestId: null | string = null;

		for (const other of positions) {
			if (position.id === other.id) continue;

			const dx = position.x - other.x;
			const dy = position.y - other.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance > maxDistance) {
				maxDistance = distance;
				farthestId = other.id;
			}
		}

		if (farthestId) {
			neighbors.set(position.id, farthestId);
		}
	}

	return neighbors;
}

/* * */

/**
 * Finds a random neighbor for each position
 */
export function findRandomNeighbors(
	positions: GridPosition[],
): Map<string, string> {
	const neighbors = new Map<string, string>();

	for (const position of positions) {
		const others = positions.filter(p => p.id !== position.id);

		if (others.length > 0) {
			const randomIndex = Math.floor(Math.random() * others.length);
			neighbors.set(position.id, others[randomIndex].id);
		}
	}

	return neighbors;
}
