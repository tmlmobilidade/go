/* * */

import { getQualifiedTripId } from '@tmlmobilidade/go-hub-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsStopTimes } from '@tmlmobilidade/go-types-gtfs';
import { type HubGtfsExportStopTimesInput, HubGtfsExportStopTimesSchema } from '@tmlmobilidade/go-types-hub';
import { type StopId } from '@tmlmobilidade/go-types-infrastructure';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';

import { type ExportGtfsContext } from '../types/context.js';

/**
 * Export the stop_times.txt file.
 * @param planData The plan data.
 * @param sqlTables The SQL tables.
 * @param context The export context.
 */
export async function exportStopTimesFile(context: ExportGtfsContext, planData: Plan, sqlTables: GtfsSQLTables) {
	//

	//
	// Fetch all stops for the current agency
	// and build a map of flag IDs to stop_id

	const allStopsData = await goDb.infrastructure.stops.findMany({ 'flags.agency_ids': { $in: [planData.agency_id] } });

	const allStopsMap = new Map<string, StopId>();

	for (const stopData of allStopsData) {
		for (const flag of stopData.flags) {
			allStopsMap.set(flag.stop_id, stopData._id);
		}
	}

	for await (const stopTimeItem of sqlTables.stop_times.stream('ORDER BY trip_id, stop_sequence ASC')) {
		const stopTimeData: GtfsStopTimes = stopTimeItem;
		const matchingStopId = allStopsMap.get(stopTimeData.stop_id);
		if (!matchingStopId) {
			Logger.error({ message: `Stop time ${stopTimeData.stop_id} not found in stops map for agency ${planData.agency_id}` });
			continue;
		}
		const parsedStopTimesRow: HubGtfsExportStopTimesInput = {
			arrival_time: stopTimeData.arrival_time,
			continuous_drop_off: stopTimeData.continuous_drop_off,
			continuous_pickup: stopTimeData.continuous_pickup,
			departure_time: stopTimeData.departure_time,
			drop_off_type: stopTimeData.drop_off_type,
			pickup_type: stopTimeData.pickup_type,
			shape_dist_traveled: stopTimeData.shape_dist_traveled,
			stop_headsign: stopTimeData.stop_headsign,
			stop_id: String(matchingStopId),
			stop_sequence: stopTimeData.stop_sequence,
			timepoint: stopTimeData.timepoint,
			trip_id: getQualifiedTripId(planData._id, planData.agency_id, stopTimeData.trip_id),
		};
		const validatedStopTimesRow = HubGtfsExportStopTimesSchema.parse(parsedStopTimesRow);
		await context.writers.stop_times.write(validatedStopTimesRow);
	}

	await context.writers.stop_times.flush();

	Logger.info({ message: 'Exported stop_times.txt file.' });
}
