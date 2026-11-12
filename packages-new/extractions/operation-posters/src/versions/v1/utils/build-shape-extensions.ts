/* * */

import { type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type OperationPostersV1ShapesExt } from '@tmlmobilidade/go-types-operation';

import { isBaseShape } from '../lib/is-base-shape.js';
import { getPosterRouteId } from './get-poster-route-id.js';

/* * */

/**
 * Order patterns within each poster route and direction and attach notes once per shape.
 * @param trips - Trips with their original route and shape IDs.
 * @returns Pattern ordering, priority and notes keyed by shape ID.
 */
export function buildShapeExtensions(trips: GtfsStrictV30Trips[]): Map<string, OperationPostersV1ShapesExt> {
	//

	//
	// A. Group trips by poster route and direction

	const groups = new Map<string, GtfsStrictV30Trips[]>();
	for (const trip of trips) {
		const key = JSON.stringify([getPosterRouteId(trip.route_id), trip.direction_id]);
		const group = groups.get(key) ?? [];
		group.push(trip);
		groups.set(key, group);
	}

	//
	// B. Order each group's patterns and build one extension per shape

	const extensions = new Map<string, OperationPostersV1ShapesExt>();
	for (const group of groups.values()) {
		//
		// 1. Place every _0 shape first, followed by the remaining distinct variants

		const baseRouteId = getPosterRouteId(group[0].route_id);
		const shapeIds = [...new Set(group.map(trip => trip.shape_id))].sort((a, b) =>
			Number(isBaseShape(b, baseRouteId)) - Number(isBaseShape(a, baseRouteId)) || a.localeCompare(b, undefined, { numeric: true }));

		//
		// 2. Assign sequence, priority and the variant note

		for (const [index, shapeId] of shapeIds.entries()) {
			const sequence = index + 1;
			const isBase = isBaseShape(shapeId, baseRouteId);
			const existing = extensions.get(shapeId);
			if (existing && existing.sequence_number !== sequence) throw new Error(`Shape ${shapeId} has conflicting variant orders.`);
			extensions.set(shapeId, {
				direction_description: '',
				note: isBase ? '' : `O número ${sequence} corresponde a outro percurso da mesma linha`,
				priority_number: isBase ? 1 : 2,
				sequence_number: sequence,
				shape_id: shapeId,
				via_text: '',
			});
		}
	}

	return extensions;
}

