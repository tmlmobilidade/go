/* * */

import { HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { rides, ridesBatchAggregationPipeline } from '@tmlmobilidade/interfaces';
import { normalizeRide } from '@tmlmobilidade/normalizers';
import { type ActionsOf, type GetRidesBatchQuery, GetRidesBatchQuerySchema, type Permission, PermissionCatalog, type RideNormalized } from '@tmlmobilidade/types';
import { type HttpResponse } from '@tmlmobilidade/utils';
import { type WebSocket } from 'ws';

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

	/**
	 * WebSocket event handler.
	 * @param socket The WebSocket object.
	 */
	static websocket(socket: WebSocket) {
		socket.on('message', async () => {
			//

			//
			// Connect to and prepare Rides database collection.

			const ridesCollection = await rides.getCollection();

			//
			// Start a watch service for the database
			// and send updates to the client as they occur.

			ridesCollection
				.watch([], { fullDocument: 'updateLookup' })
				.on('change', (databaseOperation) => {
					if (typeof databaseOperation['fullDocument'] === 'undefined') {
						console.log('Undefined document:', databaseOperation);
						return;
					}
					const normalizedRide = normalizeRide(databaseOperation['fullDocument']);
					const message: HttpResponse<RideNormalized> = {
						data: normalizedRide,
						error: null,
						statusCode: HttpStatus.OK,
					};
					socket.send(JSON.stringify(message));
				});

			//
		});
	}

	//
}
