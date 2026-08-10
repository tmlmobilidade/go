/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { ridesProvider } from '@tmlmobilidade/go-providers-rides';
import { type GetRidesBatchQuery, GetRidesBatchQuerySchema, type Ride } from '@tmlmobilidade/go-types-operation';
import { type ActionsOf, type Permission, PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Gets a batch of Rides built with an aggregation pipeline.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getRides<S extends Permission['scope']>(request: FastifyRequest<{ Querystring: GetRidesBatchQuery }>, reply: FastifyReply<Ride[]>, scope: S, action: ActionsOf<S>) {
	//

	//
	// Validate the request query parameters

	const parsedQuery = GetRidesBatchQuerySchema.parse(request.query);

	//
	// Detect which agency_ids the user has access to,
	// based on their permissions. If none, return an empty array.

	const ridesPermission = PermissionCatalog.get(request.permissions, scope, action);

	if (!ridesPermission) throw new Error(`No permissions found for scope: ${scope} and action: ${action}`);

	if (!ridesPermission['resources']?.agency_ids?.length) throw new Error(`No agency_ids found in permissions for scope: ${scope} and action: ${action}`);

	const allowAllAgencies = ridesPermission['resources'].agency_ids.includes(PermissionCatalog.ALLOW_ALL_FLAG);

	//
	// If search is provided, immediately try to find the ride by ID.
	// If found, return it as the only result. This optimizes
	// for the common case of searching by ride ID.

	const searchQuery = parsedQuery.search?.trim() ?? '';

	const foundRideById = await ridesProvider.findRideById(searchQuery);

	if (foundRideById && !allowAllAgencies && !ridesPermission['resources'].agency_ids.includes(foundRideById.agency_id)) {
		return reply.send({ data: null, error: 'User is not allowed to access this ride (not in allowed agency_ids)', statusCode: HTTP_STATUS.FORBIDDEN });
	}

	if (foundRideById) {
		// const normalizedRide = ridesProvider.normalizeRide(foundRideById);
		return reply.send({ data: [foundRideById], error: null, statusCode: HTTP_STATUS.OK });
	}

	//
	// Get the rides batch using native MongoDB cursor
	// with batchSize to prevent memory issues

	// const pipeline = ridesBatchAggregationPipeline({
	// 	acceptance_status: parsedQuery.acceptance_status,
	// 	agency_ids: parsedQuery.agency_ids?.filter(id => allowAllAgencies || ridesPermission['resources'].agency_ids.includes(id)) ?? [],
	// 	analysis_ended_at_last_stop_grade: parsedQuery.analysis_ended_at_last_stop_grade,
	// 	analysis_expected_apex_validation_interval: parsedQuery.analysis_expected_apex_validation_interval,
	// 	analysis_simple_three_vehicle_events_grade: parsedQuery.analysis_simple_three_vehicle_events_grade,
	// 	analysis_transaction_sequentiality: parsedQuery.analysis_transaction_sequentiality,
	// 	date_end: parsedQuery.date_end,
	// 	date_start: parsedQuery.date_start,
	// 	delay_statuses: parsedQuery.delay_statuses,
	// 	line_ids: parsedQuery.line_ids,
	// 	operational_statuses: parsedQuery.operational_statuses,
	// 	search: parsedQuery.search,
	// 	seen_statuses: parsedQuery.seen_statuses,
	// 	stop_ids: parsedQuery.stop_ids,
	// 	//
	// 	ticketing_status: parsedQuery.ticketing_status,
	// });

	//
	// Limit the number of rides to 2000 and sort by start_time_scheduled

	// pipeline.push({ $limit: 2000 }, { $sort: { start_time_scheduled: 1 } });

	//
	// Fetch the rides batch from the database

	// const ridesBatch = await goDb.operation.rides.aggregate(pipeline);

	//
	// Send the response

	reply.send({
		data: [],
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
