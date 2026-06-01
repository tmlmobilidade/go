/* * */

import { Dates } from '@tmlmobilidade/dates';
import { rides, stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert, type GtfsRtEntitySelector, UnixTimestamp } from '@tmlmobilidade/types';
import { getPublicRouteId } from '@tmlmobilidade/utils';

/* * */

export async function transformReferenceTypeLines(alertData: Alert): Promise<GtfsRtEntitySelector[] | undefined> {
	//

	//
	// Validate required input properties

	if (!alertData.agency_id || !alertData.references?.length) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert references are missing for "lines" reference type.`);
		return;
	}

	if (!alertData.active_period_start_date) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert active_period_start_date is missing.`);
		return;
	}

	//
	// For each line, add its corresponding
	// agency_id and route_id to the result

	const result: GtfsRtEntitySelector[] = [];

	for (const reference of alertData.references) {
		//

		//
		// Set a default end date to one hour after the current time
		// to limit the search for rides if active_period_end_date is not provided.

		let activePeriodEndDate: UnixTimestamp;

		if (!alertData.active_period_end_date) activePeriodEndDate = Dates.now('Europe/Lisbon').plus({ hours: 1 }).unix_timestamp;
		else activePeriodEndDate = alertData.active_period_end_date;

		//
		// Find distinct values of route_id
		// for rides matching the line ID,
		// the agency ID, and the alert start time.

		const foundRouteIds = await rides.aggregate([
			{
				$match: {
					agency_id: alertData.agency_id,
					line_id: Number(reference.parent_id),
					start_time_scheduled: {
						$gte: alertData.active_period_start_date,
						$lte: activePeriodEndDate,
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
			Logger.error(`[Alert ID: ${alertData._id}] No rides found for line ID ${reference.parent_id} and start time ${alertData.active_period_start_date}.`);
			continue;
		}

		const uniqueRouteIds = Array.from(new Set(foundRouteIds.map(item => item._id)));

		//
		// Generate an EntitySelector
		// for each distinct route_id found.

		for (const routeId of uniqueRouteIds) {
			//

			const parsedEntitySelector: GtfsRtEntitySelector = {
				agency_id: alertData.agency_id,
				route_id: getPublicRouteId(alertData.agency_id, routeId),
			};

			if (!reference.child_ids?.length) {
				result.push(parsedEntitySelector);
				continue;
			}

			//
			// If there are child_ids, which in this context
			// represent stop IDs associated with the line,
			// add an EntitySelector object for each stop ID.

			for (const childId of reference.child_ids) {
				const foundStopData = await stops.findOne({
					'flags.agency_ids': { $in: [alertData.agency_id] },
					'flags.stop_id': childId,
				});
				if (!foundStopData) {
					Logger.error(`[Alert ID: ${alertData._id}] Stop ID ${childId} not found for agency ID ${alertData.agency_id}.`);
					continue;
				}
				result.push({
					...parsedEntitySelector,
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
