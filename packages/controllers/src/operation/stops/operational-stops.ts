/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { AggregationPipeline, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type ActionsOf, type GetOperationalStopsBatchQuery, GetOperationalStopsBatchQuerySchema, HashedTrip, OperationalDate, OperationalLine, type Permission, PermissionCatalog } from '@tmlmobilidade/types';

/* * */

interface PipelineResult {
	agency_id: string
	hashed_trip_doc: HashedTrip
	operational_date: OperationalDate
	plan_id: string
}

/* * */

export class OperationalStopsSharedController {
	//

	/**
	 * Gets a batch of Operational Stops built with an aggregation pipeline.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getBatch<S extends Permission['scope']>(request: FastifyRequest<{ Querystring: GetOperationalStopsBatchQuery }>, reply: FastifyReply<OperationalLine[]>, scope: S, action: ActionsOf<S>) {
		//

		//
		// Validate the request query parameters

		const parsedQuery = GetOperationalStopsBatchQuerySchema.parse(request.query);

		//
		// Detect which agency_ids the user has access to,
		// based on their permissions. If none, return an empty array.

		const ridesPermission = PermissionCatalog.get(request.permissions, scope, action);

		if (!ridesPermission['resources']?.agency_ids?.length) return reply.send({ data: [], error: null, statusCode: HTTP_STATUS.OK });

		const allowAllAgencies = ridesPermission['resources'].agency_ids.includes(PermissionCatalog.ALLOW_ALL_FLAG);

		//
		// Use Rides as the baseline to fetch distinct hashed_trip_ids matching the query parameters.
		// Rides are the glue between the different entities (Patterns, Lines, Stops, etc...) that compose an Operation,
		// Stream the rides to build the Operation Lines batch on the fly, avoiding loading everything in memory at once.

		const pipeline: AggregationPipeline<PipelineResult> = [
			{
				$match: {
					agency_id: { $in: parsedQuery.agency_ids?.filter(id => allowAllAgencies || ridesPermission['resources'].agency_ids.includes(id)) ?? [] },
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
			savedOperationalLine.hashed_trips.push(item.hashed_trip_doc);
			savedOperationalLine.pattern_ids = Array.from(new Set([...savedOperationalLine.pattern_ids, item.hashed_trip_doc.pattern_id]));
			savedOperationalLine.route_ids = Array.from(new Set([...savedOperationalLine.route_ids, item.hashed_trip_doc.route_id]));
			savedOperationalLine.stop_ids = Array.from(new Set([...savedOperationalLine.stop_ids, ...(item.hashed_trip_doc.path.map(stop => stop.stop_id) ?? [])]));
		});

		//
		// Send the response

		reply.send({
			data: Array.from(operationalLinesMap.values()),
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	//
}
