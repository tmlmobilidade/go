/* * */

import { type AggregationPipeline, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type GetOperationalLinesBatchQuery, type HashedTrip, type OperationalDate, type OperationalLine } from '@tmlmobilidade/types';

/* * */

interface PipelineResult {
	agency_id: string
	hashed_trip_doc: HashedTrip
	operational_date: OperationalDate
	plan_id: string
}

/* * */

export async function getOperationalLinesBatch(query: GetOperationalLinesBatchQuery): Promise<OperationalLine[]> {
	//

	//
	// Use Rides as the baseline to fetch distinct hashed_trip_ids matching the query parameters.
	// Rides are the glue between the different entities (Patterns, Lines, Stops, etc...) that compose an Operation,
	// Stream the rides to build the Operation Lines batch on the fly, avoiding loading everything in memory at once.

	const pipeline: AggregationPipeline<PipelineResult> = [
		{
			$match: {
				agency_id: { $in: query.agency_ids ?? [] },
				start_time_scheduled: { $gte: query.date_start, $lte: query.date_end },
			},
		},
		{
			$group: {
				_id: '$hashed_trip_id',
				latest_ride: {
					$top: {
						output: {
							agency_id: '$agency_id',
							hashed_trip_id: '$hashed_trip_id',
							operational_date: '$operational_date',
							plan_id: '$plan_id',
							start_time_scheduled: '$start_time_scheduled',
						},
						// deterministic tie-break if same timestamp appears multiple times
						sortBy: { start_time_scheduled: -1, _id: -1 },
					},
				},
			},
		} as unknown as AggregationPipeline<PipelineResult>[number],
		{
			$replaceRoot: {
				newRoot: '$latest_ride',
			},
		},
		{
			$sort: {
				start_time_scheduled: -1,
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
			$project: {
				_id: 0,
				agency_id: 1,
				hashed_trip_doc: 1, // full joined document
				operational_date: 1,
				plan_id: 1,
				start_time_scheduled: 1,
			},
		},
	];

	const ridesCollection = await rides.getCollection();

	const pipelineResult = await ridesCollection
		.aggregate<PipelineResult>(pipeline, { allowDiskUse: true })
		.toArray();

	Logger.info(`OperationalLinesController.getBatch - pipeline result count: ${pipelineResult?.length ?? 0}`);

	//
	// Setup the final Map to keep track of the Operation Lines,
	// using the line_id as the key to avoid duplicates,
	// since multiple hashed_trip_ids can belong to the same line_id.

	const operationalLinesMap = new Map<OperationalLine['line_id'], OperationalLine>();

	pipelineResult.forEach((item) => {
		// Initialize the line in the map if it doesn't exist yet
		if (!operationalLinesMap.has(item.hashed_trip_doc.line_id)) {
			operationalLinesMap.set(item.hashed_trip_doc.line_id, {
				agency_id: item.agency_id,
				hashed_trips: [],
				last_operational_date: item.operational_date,
				last_plan_id: item.plan_id,
				line_id: item.hashed_trip_doc.line_id,
				line_long_name: item.hashed_trip_doc.line_long_name,
				line_short_name: item.hashed_trip_doc.line_short_name,
				pattern_ids: [],
				route_color: item.hashed_trip_doc.route_color,
				route_ids: [],
				stop_ids: [],
			});
		}
		// Get the saved line from the map
		const savedOperationalLine = operationalLinesMap.get(item.hashed_trip_doc.line_id);
		// Update the object with the latest fields
		savedOperationalLine.route_ids = Array.from(new Set([...savedOperationalLine.route_ids, item.hashed_trip_doc.route_id]));
		savedOperationalLine.pattern_ids = Array.from(new Set([...savedOperationalLine.pattern_ids, item.hashed_trip_doc.pattern_id]));
		savedOperationalLine.stop_ids = Array.from(new Set([...savedOperationalLine.stop_ids, ...(item.hashed_trip_doc.path.map(stop => stop.stop_id) ?? [])]));
		savedOperationalLine.hashed_trips.push(item.hashed_trip_doc);
	});

	//
	// Send the response

	return Array.from(operationalLinesMap.values());

	//
}
