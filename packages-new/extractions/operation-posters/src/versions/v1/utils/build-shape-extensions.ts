/* * */

import { type ShapesExt } from '@tmlmobilidade/go-types-gtfs-hitouch';
import { type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';

import { isBaseShape } from '../lib/is-base-shape.js';
import { getPosterRouteId } from './get-poster-route-id.js';

/* * */

/**
 * Order patterns within each poster route and direction and attach notes once per shape.
 * @param trips - Trips with their original route and shape IDs.
 * @returns Pattern ordering, priority and notes keyed by shape ID.
 */
export function buildShapeExtensions(trips: GtfsStrictV30Trips[]): Map<string, ShapesExt> {
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

	const extensions = new Map<string, ShapesExt>();
	for (const group of groups.values()) {
		//
		// 1. Place every _0 shape first, followed by the remaining distinct variants

		const baseRouteId = getPosterRouteId(group[0].route_id);
		const shapeIds = [...new Set(group.map(trip => trip.shape_id))].sort((a, b) =>
			Number(isBaseShape(b, baseRouteId)) - Number(isBaseShape(a, baseRouteId)) || a.localeCompare(b, undefined, { numeric: true }));

		//
		// 2. Assign sequence, priority and the variant note

		let variantCount = 0;
		for (const [index, shapeId] of shapeIds.entries()) {
			//
			// A. setup variables

			const sequence = index + 1;
			const isBase = isBaseShape(shapeId, baseRouteId);
			let variantIdentifier = '';

			//
			// B. Build the variant identifier

			if (!isBase) {
				variantCount++;
				for (let value = variantCount; value > 0; value = Math.floor((value - 1) / 26)) {
					variantIdentifier = String.fromCharCode(65 + (value - 1) % 26) + variantIdentifier;
				}
			}

			//
			// C. Add the extension

			const existing = extensions.get(shapeId);
			if (existing && existing.sequence_number !== sequence) throw new Error(`Shape ${shapeId} has conflicting variant orders.`);
			extensions.set(shapeId, {
				direction_description: '',
				note: isBase ? '' : `Corresponde a outro percurso da linha ${baseRouteId}`,
				priority_number: isBase ? 1 : 2,
				sequence_number: sequence,
				shape_id: shapeId,
				via_text: '',
			});
		}
	}

	//
	// C. Return the shape extensions

	return extensions;
}

