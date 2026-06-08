/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type ExportGtfsContext } from '@/types/context.js';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type GTFS_StopTime, type Plan } from '@tmlmobilidade/types';
import { getPublicTripId } from '@tmlmobilidade/utils';

/* * */

export interface ExportedStopTimesRow {
	trip_id: string
	arrival_time: string
	departure_time: string
	stop_id: number
	stop_sequence: number
	pickup_type: 0 | 1 | 2 | 3
	drop_off_type: 0 | 1 | 2 | 3
	continuous_pickup: 0 | 1 | 2 | 3
	continuous_drop_off: 0 | 1 | 2 | 3
	shape_dist_traveled: number
	timepoint: 0 | 1
}

/**
 * Export the stop_times.txt file.
 * @param planData The plan data.
 * @param sqlTables The SQL tables.
 * @param context The export context.
 */
export async function exportStopTimesFile(planData: Plan, sqlTables: GtfsSQLTables, context: ExportGtfsContext) {
	//

	//
	// Fetch all stops for the current agency
	// and build a map of legacy_ids to stop_id

	const allStopsData = await stops.findMany(
		{ 'flags.agency_ids': { $in: [planData.gtfs_agency.agency_id] } },
		{ sort: { _id: 1 }, projection: { _id: 1, legacy_ids: 1, flags: 1 } },
	);

	const allStopsMap = new Map<string, number>();

	for (const stopData of allStopsData) {
		for (const flag of stopData.flags) {
			allStopsMap.set(flag.stop_id, stopData._id);
		}
	}

	for await (const stopTimeItem of sqlTables.stop_times.stream('ORDER BY trip_id, stop_sequence ASC')) {
		const stopTimeData: GTFS_StopTime = stopTimeItem;
		const matchingStopId = allStopsMap.get(stopTimeData.stop_id);
		if (!matchingStopId) {
			Logger.error(`Stop time ${stopTimeData.stop_id} not found in stops map for agency ${planData.gtfs_agency.agency_id}`);
			continue;
		}
		const parsedStopTimesRow: ExportedStopTimesRow = {
			trip_id: getPublicTripId(planData._id, planData.gtfs_agency.agency_id, stopTimeData.trip_id),
			arrival_time: stopTimeData.arrival_time,
			departure_time: stopTimeData.departure_time,
			stop_id: matchingStopId,
			stop_sequence: stopTimeData.stop_sequence,
			pickup_type: stopTimeData.pickup_type ?? 0,
			drop_off_type: stopTimeData.drop_off_type ?? 0,
			continuous_pickup: stopTimeData.continuous_pickup ?? 0,
			continuous_drop_off: stopTimeData.continuous_drop_off ?? 0,
			shape_dist_traveled: stopTimeData.shape_dist_traveled ?? 0,
			timepoint: stopTimeData.timepoint ?? 0,
		};
		await context.writers.stop_times.write(parsedStopTimesRow);
	}

	await context.writers.stop_times.flush();

	Logger.info('Exported stop_times.txt file.');
}
