/* * */

import { rides, stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert, type GtfsRtEntitySelector } from '@tmlmobilidade/types';
import { getPublicRouteId } from '@tmlmobilidade/utils';

/* * */

export async function transformReferenceTypeStops(alertData: Alert): Promise<GtfsRtEntitySelector[] | undefined> {
	//

	//
	// Validate required input properties

	if (!alertData.agency_id || !alertData.references?.length) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert references are missing for "stops" reference type.`);
		return;
	}

	if (!alertData.active_period_start_date) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert active_period_start_date is missing.`);
		return;
	}

	if (!alertData.active_period_end_date) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert active_period_end_date is missing.`);
		return;
	}

	//
	// For each stop, add its corresponding
	// agency_id and route_id to the result

	const result: GtfsRtEntitySelector[] = [];

	for (const reference of alertData.references) {
		//

		const foundStopData = await stops.findOne({
			'flags.agency_ids': { $in: [alertData.agency_id] },
			'flags.stop_id': reference.parent_id,
		});

		if (!foundStopData) {
			Logger.error(`[Alert ID: ${alertData._id}] Stop ID ${reference.parent_id} not found for agency ID ${alertData.agency_id}.`);
			continue;
		}

		const parsedEntitySelector: GtfsRtEntitySelector = {
			agency_id: alertData.agency_id,
			stop_id: String(foundStopData._id),
		};

		if (!reference.child_ids?.length) {
			result.push(parsedEntitySelector);
			continue;
		}

		//
		// If there are child_ids, which in this context
		// represent line IDs associated with the stop,
		// add a GtfsRtEntitySelector object for each line ID.

		for (const childId of reference.child_ids) {
			//

			//
			// Find distinct values of route_id
			// for rides matching the line ID,
			// the agency ID, and the alert start time.

			const foundRouteIds = await rides.aggregate([
				{
					$match: {
						agency_id: alertData.agency_id,
						line_id: Number(childId),
						start_time_scheduled: {
							$gte: alertData.active_period_start_date,
							$lte: alertData.active_period_end_date,
						},
					},
				},
				{
					$group: {
						_id: '$route_id',
					},
				},
			]);

			if (!foundRouteIds?.length) {
				Logger.error(`[Alert ID: ${alertData._id}] No rides found for line ID ${childId} and start time ${alertData.active_period_start_date}.`);
				continue;
			}

			const uniqueRouteIds = Array.from(new Set(foundRouteIds.map(item => item._id)));

			//
			// Generate an EntitySelector
			// for each distinct route_id found.

			for (const routeId of uniqueRouteIds) {
				result.push({
					agency_id: alertData.agency_id,
					route_id: getPublicRouteId(alertData.agency_id, routeId),
					stop_id: String(foundStopData._id),
				});
			}

			//
		}

		//
	}

	//
	// Return the compiled list
	// of EntitySelector objects

	return result;

	//
}
