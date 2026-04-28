/* * */

import { AggregationPipeline, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type GetOperationalStopsBatchQuery, GetOperationalStopsBatchQuerySchema, type HashedTrip, type OperationalDate, type OperationalStop } from '@tmlmobilidade/types';

/* * */

interface PipelineResult {
	agency_id: string
	hashed_trip_doc: HashedTrip
	operational_date: OperationalDate
	plan_id: string
}

/* * */

export async function getOperationalStopsBatch(query: GetOperationalStopsBatchQuery): Promise<OperationalStop[]> {
	//

	//
	// Validate the request query parameters

	const parsedQuery = GetOperationalStopsBatchQuerySchema.parse(query);

	//
	// Use Rides as the baseline to fetch distinct hashed_trip_ids matching the query parameters.
	// Rides are the glue between the different entities (Patterns, Lines, Stops, etc...) that compose an Operation,
	// Stream the rides to build the Operation Lines batch on the fly, avoiding loading everything in memory at once.

	const pipeline: AggregationPipeline<PipelineResult> = [
		{
			$match: {
				agency_id: { $in: parsedQuery.agency_ids ?? [] },
				start_time_scheduled: { $gte: parsedQuery.date_start, $lte: parsedQuery.date_end },
			},
		},
		{
			$sort: {
				start_time_scheduled: -1, // newest first
			},
		},
		{
			$group: {
				_id: '$hashed_trip_id',
				agency_id: { $first: '$agency_id' },
				hashed_trip_id: { $first: '$hashed_trip_id' },
				line_id: { $first: '$line_id' },
				operational_date: { $first: '$operational_date' },
				plan_id: { $first: '$plan_id' },
				start_time_scheduled: { $first: '$start_time_scheduled' },
			},
		},
		{
			$sort: {
				start_time_scheduled: -1,
			},
		},
		{
			$project: {
				_id: 0,
				agency_id: 1,
				hashed_trip_id: 1,
				line_id: 1,
				operational_date: 1,
				plan_id: 1,
				start_time_scheduled: 1,
			},
		},
		{
			$lookup: {
				as: 'hashed_trip_doc',
				foreignField: '_id',
				from: 'hashed_trips',
				localField: 'hashed_trip_id',
			},
		},
		{
			$unwind: {
				path: '$hashed_trip_doc',
				preserveNullAndEmptyArrays: true,
			},
		},
		{
			$sort: {
				start_time_scheduled: -1,
			},
		},
		{
			$project: {
				_id: 0,
				agency_id: 1,
				hashed_trip_doc: 1, // full joined document
				operational_date: 1,
				plan_id: 1,
			},
		},
	];

	const ridesCollection = await rides.getCollection();

	const pipelineResult = await ridesCollection
		.aggregate<PipelineResult>(pipeline)
		.toArray();

	Logger.info(`OperationalStopsController.getBatch - pipeline result count: ${pipelineResult?.length ?? 0}`);

	//
	// Setup the final Map to keep track of the Operation Stops,
	// using the stop_id as the key to avoid duplicates,
	// since multiple hashed_trip_ids can belong to the same stop_id.

	const operationalStopsMap = new Map<OperationalStop['stop_id'], OperationalStop>();

	pipelineResult.forEach((item) => {
		item.hashed_trip_doc.path.forEach((waypoint) => {
			// Initialize the stop in the map if it doesn't exist yet
			if (!operationalStopsMap.has(waypoint.stop_id)) {
				operationalStopsMap.set(waypoint.stop_id, {
					agency_ids: [],
					hashed_trips: [],
					last_operational_date: item.operational_date,
					last_plan_id: item.plan_id,
					line_ids: [],
					pattern_ids: [],
					route_ids: [],
					stop_id: waypoint.stop_id,
					stop_name: waypoint.stop_name,
				});
			}
			// Get the saved stop from the map
			const savedOperationalStop = operationalStopsMap.get(waypoint.stop_id);
			// Update the object with the latest fields
			savedOperationalStop.agency_ids = Array.from(new Set([...savedOperationalStop.agency_ids, item.agency_id]));
			savedOperationalStop.line_ids = Array.from(new Set([...savedOperationalStop.line_ids, item.hashed_trip_doc.line_id]));
			savedOperationalStop.route_ids = Array.from(new Set([...savedOperationalStop.route_ids, item.hashed_trip_doc.route_id]));
			savedOperationalStop.pattern_ids = Array.from(new Set([...savedOperationalStop.pattern_ids, item.hashed_trip_doc.pattern_id]));
			savedOperationalStop.hashed_trips.push(item.hashed_trip_doc);
		});
	});

	//
	// Send the response

	return Array.from(operationalStopsMap.values());

	//
}
