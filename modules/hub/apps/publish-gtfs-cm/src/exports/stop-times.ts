/* * */

import { getQualifiedTripId } from '@tmlmobilidade/go-hub-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsStopTimes } from '@tmlmobilidade/go-types-gtfs';
import { type HubGtfsExportStopTimesInput, HubGtfsExportStopTimesSchema } from '@tmlmobilidade/go-types-hub';
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

	const allStopsList = await goDb.infrastructure.stops.findMany();
	const allStopsMap = new Map<string, string>();

	allStopsList.forEach((stopData) => {
		if (!stopData.flags?.length) allStopsMap.set(stopData._id, stopData._id);
		stopData.flags?.forEach((flag) => {
			if (flag.is_harmonized) allStopsMap.set(flag.stop_id, stopData._id);
			else allStopsMap.set(flag.stop_id, flag.stop_id);
		});
		stopData.legacy_ids?.forEach((legacyId) => {
			allStopsMap.set(legacyId, stopData._id);
		});
	});

	for await (const stopTimeItem of sqlTables.stop_times.stream('ORDER BY trip_id, stop_sequence ASC')) {
		const stopTimeData: GtfsStopTimes = stopTimeItem;
		const stopId = allStopsMap.get(stopTimeData.stop_id);
		const parsedStopTimesRow: HubGtfsExportStopTimesInput = {
			arrival_time: stopTimeData.arrival_time,
			continuous_drop_off: '0',
			continuous_pickup: '0',
			departure_time: stopTimeData.departure_time,
			drop_off_type: stopTimeData.drop_off_type ?? '0',
			pickup_type: stopTimeData.pickup_type ?? '0',
			shape_dist_traveled: stopTimeData.shape_dist_traveled ?? 0,
			stop_id: stopId,
			stop_sequence: stopTimeData.stop_sequence,
			timepoint: stopTimeData.timepoint ?? '0',
			trip_id: getQualifiedTripId(planData._id, planData.agency_id, stopTimeData.trip_id),
		};
		const validatedStopTimesRow = HubGtfsExportStopTimesSchema.parse(parsedStopTimesRow);
		await context.writers.stop_times.write(validatedStopTimesRow);
	}

	await context.writers.stop_times.flush();

	Logger.info({ message: 'Exported stop_times.txt file.' });
}
