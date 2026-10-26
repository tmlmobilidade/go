/* * */

import { GtfsStrictV30SteppTripsSchema } from '@tmlmobilidade/go-types-gtfs-strict';

import { type Pattern, type PlanExportConfig, type Row, type Trip } from '../types.js';
import { mergeSharedRow } from '../utils/merge.js';
import { required } from '../utils/rows.js';

/* * */

/** Prepare trips definitions from one normalized plan. */
export async function exportTrips(config: PlanExportConfig, trips: Map<string, Trip>) {
	const patterns = new Map<string, Pattern>();
	const directionReferences = new Map<string, Row>();
	for (const [id, trip] of trips) {
		if (!trip.first || !trip.last) throw new Error(`Trip "${id}" has no stop times`);
		const row = trip.row;
		const routeId = required(row, 'route_id');
		const reference = directionReferences.get(routeId);
		if (!reference) directionReferences.set(routeId, row);
		const derivedDirection = reference && row.trip_headsign !== reference.trip_headsign && row.shape_id !== reference.shape_id ? '1' : '0';
		const output = {
			...row,
			bikes_allowed: row.bikes_allowed ?? '0',
			block_id: row.block_id || undefined,
			direction_id: row.direction_id ?? derivedDirection,
			service_id: required(row, 'service_id'),
			shape_id: required(row, 'shape_id'),
			trip_id: id,
			wheelchair_accessible: row.wheelchair_accessible ?? '0',
		};
		GtfsStrictV30SteppTripsSchema.parse(output);
		mergeSharedRow(config, 'trips', id, output);
		const key = JSON.stringify([routeId, row.shape_id, row.trip_headsign]);
		const circular = trip.first.stopId === trip.last.stopId;
		const previous = patterns.get(key);
		patterns.set(key, {
			circular: circular && (previous?.circular ?? true),
			firstStop: previous?.firstStop ?? trip.first.stopId,
			lastStop: previous?.lastStop ?? trip.last.stopId,
			routeId,
		});
	}

	return patterns;
}
