/* * */

import { type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';

import { getLetterIndex } from './get-letter-index.js';
import { getPosterRouteId } from './get-poster-route-id.js';

/* * */

/**
 * A variant note.
 * @property index - The index of the variant.
 * @property note - The note for the variant.
 */
export interface VariantNote {
	index: string
	note: string
}

/**
 * Identify alternative patterns within each route and direction using the original pattern IDs.
 * @param trips - The trips to build variant notes for.
 * @returns A map of shape sequences and a map of trip notes.
 */
export function buildVariantNotes(trips: GtfsStrictV30Trips[]): { shapeSequences: Map<string, number>, tripNotes: Map<string, VariantNote> } {
	//

	//
	// Group trips by route and direction.

	const groups = new Map<string, GtfsStrictV30Trips[]>();

	for (const trip of trips) {
		//
		// Create a key for the group.

		const key = JSON.stringify([getPosterRouteId(trip.route_id), trip.direction_id]);

		//
		// Get the group or create a new one.

		const group = groups.get(key) ?? [];

		//
		// Add the trip to the group.

		group.push(trip);
		groups.set(key, group);
	}

	//
	// Build variant notes and shape sequences.

	const tripNotes = new Map<string, VariantNote>();
	const shapeSequences = new Map<string, number>();
	for (const group of groups.values()) {
		//
		// Sort trips by shape and trip IDs.

		const sortedTrips = [...group].sort((a, b) => a.shape_id.localeCompare(b.shape_id) || a.trip_id.localeCompare(b.trip_id));

		//
		// Find the main trip.

		const baseRouteId = getPosterRouteId(sortedTrips[0].route_id);
		const mainTrip = sortedTrips.find(trip => trip.route_id === `${baseRouteId}_0` || trip.shape_id.startsWith(`${baseRouteId}_0_`)) ?? sortedTrips[0];
		const shapeIds = [mainTrip.shape_id, ...new Set(sortedTrips.filter(trip => trip.shape_id !== mainTrip.shape_id).map(trip => trip.shape_id))];
		const sequences = new Map(shapeIds.map((shapeId, index) => [shapeId, index + 1]));

		//
		// Build shape sequences and variant notes.

		for (const trip of sortedTrips) {
			const sequence = sequences.get(trip.shape_id);
			if (!sequence) continue;
			const existingSequence = shapeSequences.get(trip.shape_id);
			if (existingSequence && existingSequence !== sequence) throw new Error(`Shape ${trip.shape_id} has conflicting variant orders.`);
			shapeSequences.set(trip.shape_id, sequence);
			if (sequence === 1) continue;
			const index = getLetterIndex(sequence - 1);
			tripNotes.set(trip.trip_id, { index, note: `Passa a variante ${index}` });
		}
	}

	//
	// Return the shape sequences and trip notes.

	return { shapeSequences, tripNotes };
}
