/* * */

import { externalClients } from '@tmlmobilidade/external';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsRtTripUpdate } from '@tmlmobilidade/go-types-gtfs-rt';
import { type HubPlan } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger-logger-backend';
import { Timer } from '@tmlmobilidade/timer';
import { getPublicTripId } from '@tmlmobilidade/utils';

/* * */

const AGENCY_ID = 'N18KL';

export async function getCpTripUpdates(): Promise<GtfsRtTripUpdate[]> {
	//

	const timer = new Timer();

	Logger.info({ message: 'Retrieving Estimated Time of Arrivals from CP API...' });

	try {
		// Get the active plan ID for the CP agency
		const approvedPlans = await cacheDb.get('hub:v1:plans:approved:json');
		if (!approvedPlans) throw new Error('No approved plans found in API Cache');

		const activePlanId = JSON.parse(approvedPlans)
			.filter((plan: HubPlan) => plan.is_active && plan.agency_id === AGENCY_ID)
			.at(0)?._id;

		if (!activePlanId) throw new Error(`No active plan found for agency ID: ${AGENCY_ID}`);

		// Get the trip updates from the CP API
		const cpTrips = await externalClients.cp.tripUpdates();
		const cpStopIdCache = new Map<string, null | string>();
		const tripUpdates: GtfsRtTripUpdate[] = [];

		// Iterate over the trip updates and convert the stop IDs to internal IDs
		for (const entity of cpTrips.entity ?? []) {
			//

			//
			// Get the trip update from the CP API
			const tripUpdate = entity.trip_update;
			const cpTripId = tripUpdate?.trip?.trip_id;
			if (!tripUpdate || !cpTripId) continue;

			// Convert the trip ID to a public trip ID
			const publicTripId = getPublicTripId(activePlanId, AGENCY_ID, cpTripId);
			const stopTimeUpdates = [];

			// Iterate over the stop time updates and convert the stop IDs to internal IDs
			for (const stopTimeUpdate of tripUpdate.stop_time_update ?? []) {
				if (!stopTimeUpdate.stop_id) continue;

				// Check if the stop ID is already in the cache
				let internalStopId = cpStopIdCache.get(stopTimeUpdate.stop_id);
				if (internalStopId === undefined) {
					// If the stop ID is not in the cache, get it from the database
					const foundStop = await goDb.infrastructure.stops.findOne(
						{ 'flags.stop_id': stopTimeUpdate.stop_id },
						{ projection: { _id: 1 } },
					);
					// Set the internal stop ID in the cache
					internalStopId = foundStop ? String(foundStop._id) : null;
					cpStopIdCache.set(stopTimeUpdate.stop_id, internalStopId);
				}

				// If the stop ID is not found, log an error and continue
				if (!internalStopId) {
					Logger.error({ message: `CP stop ID ${stopTimeUpdate.stop_id} not found.` });
					continue;
				}

				// Add the stop time update to the list of stop time updates
				stopTimeUpdates.push({ ...stopTimeUpdate, stop_id: internalStopId });
			}

			// If there are no stop time updates, continue
			if (!stopTimeUpdates.length) continue;

			// Add the trip update to the list of trip updates
			tripUpdates.push({
				...tripUpdate,
				stop_time_update: stopTimeUpdates,
				trip: { ...tripUpdate.trip, trip_id: publicTripId },
			});
		}

		Logger.info({ message: `Found ${tripUpdates.length} CP trip updates in ${timer.get()}`, spacesAfterOrBefore: 1 });

		return tripUpdates;
	} catch (error) {
		Logger.error({ error, message: `Failed to retrieve CP trip updates in ${timer.get()}` });
		return [];
	}

	//
};
