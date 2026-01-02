/* * */

import { HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { rides, ridesBatchAggregationPipeline } from '@tmlmobilidade/interfaces';
import { normalizeRide } from '@tmlmobilidade/normalizers';
import { type ActionsOf, type GetRidesBatchQuery, GetRidesBatchQuerySchema, type Permission, PermissionCatalog, type RideNormalized } from '@tmlmobilidade/types';

/* * */

export class RidesSharedController {
	//

	/**
	 * Gets a batch of Rides built with an aggregation pipeline.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getBatch<S extends Permission['scope']>(request: FastifyRequest<{ Querystring: GetRidesBatchQuery }>, reply: FastifyReply<RideNormalized[]>, scope: S, action: ActionsOf<S>) {
		//

		//
		// Validate the request query parameters

		const parsedQuery = GetRidesBatchQuerySchema.parse(request.query);

		console.log('RidesSharedController.getBatch - parsedQuery:', parsedQuery);

		//
		// Detect which agency_ids the user has access to,
		// based on their permissions. If none, return an empty array.

		const ridesPermission = PermissionCatalog.get(request.permissions, scope, action);

		if (!ridesPermission['resources']?.agency_ids?.length) return reply.send({ data: [], error: null, statusCode: HttpStatus.OK });

		const allowAllAgencies = ridesPermission['resources'].agency_ids.includes(PermissionCatalog.ALLOW_ALL_FLAG);

		//
		// If search is provided, immediately try to find the ride by ID.
		// If found, return it as the only result. This optimizes
		// for the common case of searching by ride ID.

		const searchQuery = parsedQuery.search?.trim() ?? '';

		const foundRideById = await rides.findOne({
			_id: searchQuery,
			...(allowAllAgencies ? {} : { agency_id: { $in: ridesPermission['resources'].agency_ids } }),
		});

		if (foundRideById) {
			const normalizedRide = normalizeRide(foundRideById);
			return reply.send({ data: [normalizedRide], error: null, statusCode: HttpStatus.OK });
		}

		//
		// Get the rides batch using native MongoDB cursor
		// with batchSize to prevent memory issues

		const pipeline = ridesBatchAggregationPipeline({
			agency_ids: parsedQuery.agency_ids?.filter(id => allowAllAgencies || ridesPermission['resources'].agency_ids.includes(id)) ?? [],
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

		console.log('RidesSharedController.getBatch - ridesBatch count:', ridesBatch?.length ?? 0);

		//
		// Send the response

		reply.send({
			data: ridesBatch as RideNormalized[] ?? [],
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

	/**
	 * Get a Ride by ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getRideById<S extends Permission['scope']>(request: FastifyRequest, reply: FastifyReply<RideNormalized>, scope: S, action: ActionsOf<S>) {
		//

		//
		// Detect which agency_ids the user has access to,
		// based on their permissions. If none, return an empty array.

		const ridesPermission = PermissionCatalog.get(request.permissions, scope, action);

		if (!ridesPermission['resources']?.agency_ids?.length) return reply.send({ data: null, error: null, statusCode: HttpStatus.OK });

		const allowAllAgencies = ridesPermission['resources'].agency_ids.includes(PermissionCatalog.ALLOW_ALL_FLAG);

		//
		// If search is provided, immediately try to find the ride by ID.
		// If found, return it as the only result. This optimizes
		// for the common case of searching by ride ID.

		const foundRideById = await rides.findOne({
			_id: request.params['id'],
			...(allowAllAgencies ? {} : { agency_id: { $in: ridesPermission['resources'].agency_ids } }),
		});

		if (foundRideById) {
			const normalizedRide = normalizeRide(foundRideById);
			return reply.send({ data: normalizedRide, error: null, statusCode: HttpStatus.OK });
		}

		//
	}

	//
}
