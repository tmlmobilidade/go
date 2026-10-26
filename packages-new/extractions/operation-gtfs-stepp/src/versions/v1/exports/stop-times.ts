/* * */

import { GtfsStrictV30SteppStopTimesSchema } from '@tmlmobilidade/go-types-gtfs-strict';

import { readCsv } from '../fetchers/csv.js';
import { type PlanExportConfig, type Trip } from '../types.js';
import { groupSource } from '../utils/merge.js';
import { number, required } from '../utils/rows.js';

/* * */

/** Prepare stop-times definitions from one normalized plan. */
export async function exportStopTimes(config: PlanExportConfig, trips: Map<string, Trip>, usedStops: Set<string>) {
	const { writers } = config;
	let exportedStopTimes = 0;
	// Stream the large tables; retain only the endpoint references needed by routes_stepp.
	await readCsv(config, 'stop_times', async (row) => {
		const trip = trips.get(required(row, 'trip_id'));
		if (!trip) return;
		GtfsStrictV30SteppStopTimesSchema.parse({
			...row,
			continuous_drop_off: number(row.continuous_drop_off),
			continuous_pickup: number(row.continuous_pickup),
			shape_dist_traveled: number(row.shape_dist_traveled),
			stop_sequence: number(row.stop_sequence),
		});
		const stopId = required(row, 'stop_id');
		const sequence = Number(row.stop_sequence);
		if (!trip.first || sequence < trip.first.sequence) trip.first = { sequence, stopId };
		if (!trip.last || sequence > trip.last.sequence) trip.last = { sequence, stopId };
		usedStops.add(stopId);
		await writers.stop_times.writeCandidate(row, groupSource(required(row, 'trip_id'), config.planId));
		exportedStopTimes++;
	});

	return exportedStopTimes;
}
