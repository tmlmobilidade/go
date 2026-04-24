/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { hashedTrips, rides, ridesBatchAggregationPipeline } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type ActionsOf, type GetRidesBatchQuery, GetRidesBatchQuerySchema, type HashedTrip, type Permission, PermissionCatalog } from '@tmlmobilidade/types';

/* * */

export class OperationStopsSharedController {
	//

	/**
	 * Gets a batch of HashedTrips built with an aggregation pipeline.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getBatch<S extends Permission['scope']>(request: FastifyRequest<{ Querystring: GetRidesBatchQuery }>, reply: FastifyReply<HashedTrip[]>, scope: S, action: ActionsOf<S>) {
		//

		//
		// Validate the request query parameters

		const parsedQuery = GetRidesBatchQuerySchema.parse(request.query);

		//
		// Detect which agency_ids the user has access to,
		// based on their permissions. If none, return an empty array.

		const ridesPermission = PermissionCatalog.get(request.permissions, scope, action);

		if (!ridesPermission['resources']?.agency_ids?.length) return reply.send({ data: [], error: null, statusCode: HTTP_STATUS.OK });

		const allowAllAgencies = ridesPermission['resources'].agency_ids.includes(PermissionCatalog.ALLOW_ALL_FLAG);

		//
		// Get the rides batch using native MongoDB cursor
		// with batchSize to prevent memory issues

		const pipeline = ridesBatchAggregationPipeline({
			acceptance_status: parsedQuery.acceptance_status,
			agency_ids: parsedQuery.agency_ids?.filter(id => allowAllAgencies || ridesPermission['resources'].agency_ids.includes(id)) ?? [],
			analysis_ended_at_last_stop_grade: parsedQuery.analysis_ended_at_last_stop_grade,
			analysis_expected_apex_validation_interval: parsedQuery.analysis_expected_apex_validation_interval,
			analysis_simple_three_vehicle_events_grade: parsedQuery.analysis_simple_three_vehicle_events_grade,
			analysis_transaction_sequentiality: parsedQuery.analysis_transaction_sequentiality,
			date_end: parsedQuery.date_end,
			date_start: parsedQuery.date_start,
			delay_statuses: parsedQuery.delay_statuses,
			line_ids: parsedQuery.line_ids,
			operational_statuses: parsedQuery.operational_statuses,
			search: parsedQuery.search,
			seen_statuses: parsedQuery.seen_statuses,
			stop_ids: parsedQuery.stop_ids,
		});

		//
		// Limit the number of rides to 2000 and sort by start_time_scheduled

		pipeline.push({ $limit: 2000 }, { $project: { hashed_trip_id: 1 } }, { $sort: { start_time_scheduled: 1 } });

		//
		// Fetch the rides batch from the database

		const ridesBatch = await rides.aggregate(pipeline);

		Logger.info(`OperationStopsSharedController.getBatch - ridesBatch count: ${ridesBatch?.length ?? 0}`);

		//
		// From the given batch of hashed_trip_ids,
		// fetch the full HashedTrip documents with a single query.

		const hashedTripIds = ridesBatch.map(ride => ride.hashed_trip_id);

		const hashedTripsBatch = await hashedTrips.findMany({ _id: { $in: hashedTripIds } });

		//
		// Send the response

		reply.send({
			data: hashedTripsBatch ?? [],
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	//
}
