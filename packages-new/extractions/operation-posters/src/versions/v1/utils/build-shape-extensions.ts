/* * */

import { type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type OperationPostersV1ShapesExt } from '@tmlmobilidade/go-types-operation';

import { getPosterRouteId } from './get-poster-route-id.js';

/* * */

/**
 * Order patterns within each poster route and direction and attach notes once per shape.
 * @param trips - Trips with their original route and shape IDs.
 * @returns Pattern ordering, priority and notes keyed by shape ID.
 */
export function buildShapeExtensions(trips: GtfsStrictV30Trips[]): Map<string, OperationPostersV1ShapesExt> {
	const groups = new Map<string, GtfsStrictV30Trips[]>();
	for (const trip of trips) {
		const key = JSON.stringify([getPosterRouteId(trip.route_id), trip.direction_id]);
		const group = groups.get(key) ?? [];
		group.push(trip);
		groups.set(key, group);
	}

	const extensions = new Map<string, OperationPostersV1ShapesExt>();
	for (const group of groups.values()) {
		const sortedTrips = [...group].sort((a, b) => a.shape_id.localeCompare(b.shape_id) || a.trip_id.localeCompare(b.trip_id));
		const baseRouteId = getPosterRouteId(sortedTrips[0].route_id);
		const mainTrip = sortedTrips.find(trip => trip.route_id === `${baseRouteId}_0` || trip.shape_id.startsWith(`${baseRouteId}_0_`)) ?? sortedTrips[0];
		const shapeIds = [mainTrip.shape_id, ...new Set(sortedTrips.filter(trip => trip.shape_id !== mainTrip.shape_id).map(trip => trip.shape_id))];

		for (const [index, shapeId] of shapeIds.entries()) {
			const sequence = index + 1;
			const existing = extensions.get(shapeId);
			if (existing && existing.sequence_number !== sequence) throw new Error(`Shape ${shapeId} has conflicting variant orders.`);
			extensions.set(shapeId, {
				direction_description: '',
				note: sequence === 1 ? '' : 'O número da linha com uma letra corresponde a outro percurso da mesma linha',
				priority_number: sequence === 1 ? 1 : 2,
				sequence_number: sequence,
				shape_id: shapeId,
				via_text: '',
			});
		}
	}

	return extensions;
}
