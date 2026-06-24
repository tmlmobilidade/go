/* * */

import { type Dates } from '@tmlmobilidade/dates';
import { rides, stops } from '@tmlmobilidade/interfaces';

import { aggregationQuery } from './aggregation-query.js';
import { type AggregationResult } from './types.js';

/* * */

interface FindRideForTrainParams {
	destinationId: string
	now: Dates
}

/**
 * Finds a single Metro Lisboa ride, joining its hashed shape and trip, whose headsign matches the
 * specified destinationId (ML API stop identifier) within a time window centered on the current timestamp.
 *
 * Searches for a stop document whose flags include the given destinationId (using Metro's agency id "2").
 * Uses the matched stop's name to filter rides by headsign, and limits the scheduled start time search to
 * two hours before and after the provided 'now' timestamp.
 *
 * Returns the first ride match (if any) joined with its hashed GTFS shape and trip, or null if none found.
 *
 * @param params.destinationId - ML API stop_id for the train's destination (string, agency 2).
 * @param params.iteration - Current fetch loop iteration (for logging, unused here).
 * @param params.line - Metro line name (for logging, unused here).
 * @param params.now - Current Dates instance (reference time zone aware).
 * @param params.trainId - Unique train identifier (for logging, unused here).
 * @returns The first AggregationResult object with hashed shape and trip, or null if no match.
 *
 * Used by ml-fetch to map API train positions to GTFS rides for downstream vehicle event construction.
 */
export async function findRideForTrain({ destinationId, now }: FindRideForTrainParams): Promise<AggregationResult | null> {
	const destinationStop = await stops.findOne({
		flags: { $elemMatch: { agency_ids: '2', stop_id: destinationId } },
	});

	if (!destinationStop) return null;

	const ridesCollection = await rides.getCollection();

	const ridesAggregationResult = await ridesCollection.aggregate(
		aggregationQuery({
			endTimeScheduled: now.plus({ hours: 2 }).unix_timestamp,
			headsign: destinationStop.name,
			startTimeScheduled: now.minus({ hours: 2 }).unix_timestamp,
		}),
	).toArray() as AggregationResult[];

	if (ridesAggregationResult.length === 0) return null;

	return ridesAggregationResult[0];
}
