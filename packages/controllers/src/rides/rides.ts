/* * */

import { HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { rides, ridesBatchAggregationPipeline } from '@tmlmobilidade/interfaces';
import { normalizeRide } from '@tmlmobilidade/normalizers';
import { type GetRidesBatchQuery, GetRidesBatchQuerySchema, PermissionCatalog, type RideNormalized } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';

/* * */

export class RidesSharedController {
	//

	/**
	 * Gets a batch of Rides built with an aggregation pipeline.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getBatch(request: FastifyRequest<{ Querystring: GetRidesBatchQuery }>, reply: FastifyReply<RideNormalized[]>) {
		//

		//
		// Validate the request query parameters

		const parsedQuery = validateQueryParams<GetRidesBatchQuery>(request.query, GetRidesBatchQuerySchema);

		//
		// Detect which agency_ids the user has access to,
		// based on their permissions. If none, return an empty array.

		const ridesPermission = PermissionCatalog.get(request.permissions, PermissionCatalog.all.rides.scope, PermissionCatalog.all.rides.actions.analysis_read);

		if (!ridesPermission?.resources?.agency_ids?.length) return reply.send({ data: [], error: null, statusCode: HttpStatus.OK });

		const allowAllAgencies = ridesPermission.resources.agency_ids.includes(PermissionCatalog.ALLOW_ALL_FLAG);

		//
		// If search is provided, immediately try to find the ride by ID.
		// If found, return it as the only result. This optimizes
		// for the common case of searching by ride ID.

		const searchQuery = parsedQuery.search?.trim() ?? '';

		const foundRideById = await rides.findOne({
			_id: searchQuery,
			...(allowAllAgencies ? {} : { agency_id: { $in: ridesPermission.resources.agency_ids } }),
		});

		if (foundRideById) {
			const normalizedRide = normalizeRide(foundRideById);
			return reply.send({ data: [normalizedRide], error: null, statusCode: HttpStatus.OK });
		}

		//
		// Get the rides batch using native MongoDB cursor
		// with batchSize to prevent memory issues

		const pipeline = ridesBatchAggregationPipeline({
			agency_ids: parsedQuery.agency_ids.filter(id => allowAllAgencies || ridesPermission.resources.agency_ids.includes(id)),
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

		pipeline.push({ $limit: 2000 }, { $sort: { start_time_scheduled: 1 } });

		//
		// Fetch the rides batch from the database

		const ridesBatch = await rides.aggregate(pipeline);

		//
		// Send the response

		reply.send({
			data: ridesBatch as RideNormalized[] ?? [],
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

	//
}
