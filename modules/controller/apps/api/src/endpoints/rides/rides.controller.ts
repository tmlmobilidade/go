/* * */

import { GetRidesBatchQuery, GetRidesBatchQuerySchema } from '@/endpoints/rides/schema.js';
import { HttpStatus } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { hashedShapes, hashedTrips, rides, ridesBatchAggregationPipeline, simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations, simplifiedVehicleEvents } from '@tmlmobilidade/interfaces';
import { normalizeRide } from '@tmlmobilidade/normalizers';
import { type HashedShape, type HashedTrip, PermissionCatalog, type Ride, type RideNormalized, type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { HttpResponse, validateQueryParams } from '@tmlmobilidade/utils';
import { type WebSocket } from 'ws';

/* * */

export class RidesController {
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
		// based on their permissions.

		let allowedAgencyIds: string[] = [];

		const ridesPermission = PermissionCatalog.get(request.permissions, PermissionCatalog.all.rides.scope, PermissionCatalog.all.rides.actions.analysis_read);

		if (ridesPermission?.resources?.agency_ids && !ridesPermission.resources.agency_ids.includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			allowedAgencyIds = ridesPermission.resources.agency_ids;
		}

		//
		// If search is provided, immediately try to find the ride by ID,
		// and if found, return it right away.

		const searchQuery = parsedQuery.search?.trim() ?? '';

		const foundRideById = await rides.findOne({
			_id: searchQuery,
			...(allowedAgencyIds.length > 0 ? { agency_id: { $in: allowedAgencyIds } } : {}),
		});

		if (foundRideById) {
			const normalizedRide = normalizeRide(foundRideById);
			return reply.send({
				data: [normalizedRide],
				error: null,
				statusCode: HttpStatus.OK,
			});
		}

		//
		// Get the rides batch using native MongoDB cursor
		// with batchSize to prevent memory issues

		const pipeline = ridesBatchAggregationPipeline({
			acceptance_status: parsedQuery.acceptance_status,
			agency_ids: parsedQuery.agency_ids.filter(id => allowedAgencyIds.length === 0 || allowedAgencyIds.includes(id)),
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
	 * Get a HashedShape by Ride ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getHashedShapeByRideId(request: FastifyRequest, reply: FastifyReply<HashedShape>) {
		//
		// Validate the request parameters

		const rideId = request.params['id'];

		if (!rideId) {
			return reply
				.status(HttpStatus.BAD_REQUEST)
				.send({
					data: null,
					error: 'Missing ride_id parameter.',
					status: HttpStatus.BAD_REQUEST,
				});
		}

		//
		// Fetch the ride data from the database

		const rideData = await rides.findById(rideId);

		if (!rideData) {
			return reply
				.status(HttpStatus.NOT_FOUND)
				.send({
					data: null,
					error: 'Ride not found.',
					status: HttpStatus.NOT_FOUND,
				});
		}

		//
		// Fetch the corresponding vehicle events data
		// and send it back to the client

		const hashedShapeData = await hashedShapes.findById(rideData.hashed_shape_id);

		if (!hashedShapeData) {
			return reply
				.status(HttpStatus.NOT_FOUND)
				.send({
					data: null,
					error: 'HashedShape not found.',
					status: HttpStatus.NOT_FOUND,
				});
		}

		//
		// Send the ride data back to the client

		reply.send({
			data: hashedShapeData,
			error: null,
			statusCode: HttpStatus.OK,
		});
	}

	/**
	 * Get a HashedTrip by Ride ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getHashedTripByRideId(request: FastifyRequest, reply: FastifyReply<HashedTrip>) {
		try {
			//

			//
			// Validate the request parameters

			const rideId = request.params['id'];

			if (!rideId) {
				return reply
					.status(HttpStatus.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HttpStatus.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.findById(rideId);

			if (!rideData) {
				return reply
					.status(HttpStatus.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HttpStatus.NOT_FOUND,
					});
			}

			//
			// Fetch the corresponding vehicle events data
			// and send it back to the client

			const hashedTripData = await hashedTrips.findById(rideData.hashed_trip_id);

			if (!hashedTripData) {
				return reply
					.status(HttpStatus.NOT_FOUND)
					.send({
						data: null,
						error: 'HashedTrip not found.',
						status: HttpStatus.NOT_FOUND,
					});
			}

			//
			// Send the ride data back to the client

			reply.send({
				data: hashedTripData,
				error: null,
				statusCode: HttpStatus.OK,
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Get a Ride by ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getRideById(request: FastifyRequest, reply: FastifyReply<Ride>) {
		try {
			//

			//
			// Validate the request parameters

			const rideId = request.params['id'];

			if (!rideId) {
				return reply
					.status(HttpStatus.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HttpStatus.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.findById(rideId);

			if (!rideData) {
				return reply
					.status(HttpStatus.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HttpStatus.NOT_FOUND,
					});
			}

			//
			// Send the ride data back to the client

			reply.send({
				data: rideData,
				error: null,
				statusCode: HttpStatus.OK,
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Get a SimplifiedApexLocation by Ride ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getSimplifiedApexLocationsByRideId(request: FastifyRequest, reply: FastifyReply<SimplifiedApexLocation[]>) {
		try {
			//

			//
			// Validate the request parameters

			const rideId = request.params['id'];

			if (!rideId) {
				return reply
					.status(HttpStatus.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HttpStatus.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.findById(rideId);

			if (!rideData) {
				return reply
					.status(HttpStatus.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HttpStatus.NOT_FOUND,
					});
			}

			//
			// Fetch the corresponding vehicle events data
			// and send it back to the client

			const standardWindowInterval = Dates.fromUnixTimestamp(rideData.start_time_scheduled).std_window;

			const simplifiedApexLocationsData = await simplifiedApexLocations.findMany({
				created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
				extra_trip_id: null,
				trip_id: rideData.trip_id,
			});

			//
			// Send the ride data back to the client

			reply.send({
				data: simplifiedApexLocationsData ?? [],
				error: null,
				statusCode: HttpStatus.OK,
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Get SimplifiedApexOnBoardRefunds by Ride ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getSimplifiedApexOnBoardRefundsByRideId(request: FastifyRequest, reply: FastifyReply<SimplifiedApexOnBoardRefund[]>) {
		try {
			//

			//
			// Validate the request parameters

			const rideId = request.params['id'];

			if (!rideId) {
				return reply
					.status(HttpStatus.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HttpStatus.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.findById(rideId);

			if (!rideData) {
				return reply
					.status(HttpStatus.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HttpStatus.NOT_FOUND,
					});
			}

			//
			// Fetch the corresponding vehicle events data
			// and send it back to the client

			const standardWindowInterval = Dates.fromUnixTimestamp(rideData.start_time_scheduled).std_window;

			const simplifiedApexOnBoardRefundsData = await simplifiedApexOnBoardRefunds.findMany({
				created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
				extra_trip_id: null,
				trip_id: rideData.trip_id,
			});

			//
			// Send the ride data back to the client

			reply.send({
				data: simplifiedApexOnBoardRefundsData ?? [],
				error: null,
				statusCode: HttpStatus.OK,
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Get SimplifiedApexOnBoardSales by Ride ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getSimplifiedApexOnBoardSalesByRideId(request: FastifyRequest, reply: FastifyReply<SimplifiedApexOnBoardSale[]>) {
		try {
			//

			//
			// Validate the request parameters

			const rideId = request.params['id'];

			if (!rideId) {
				return reply
					.status(HttpStatus.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HttpStatus.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.findById(rideId);

			if (!rideData) {
				return reply
					.status(HttpStatus.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HttpStatus.NOT_FOUND,
					});
			}

			//
			// Fetch the corresponding vehicle events data
			// and send it back to the client

			const standardWindowInterval = Dates.fromUnixTimestamp(rideData.start_time_scheduled).std_window;

			const simplifiedApexOnBoardSalesData = await simplifiedApexOnBoardSales.findMany({
				created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
				extra_trip_id: null,
				trip_id: rideData.trip_id,
			});

			//
			// Send the ride data back to the client

			reply.send({
				data: simplifiedApexOnBoardSalesData ?? [],
				error: null,
				statusCode: HttpStatus.OK,
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Get SimplifiedApexValidations by Ride ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getSimplifiedApexValidationsByRideId(request: FastifyRequest, reply: FastifyReply<SimplifiedApexValidation[]>) {
		try {
			//

			//
			// Validate the request parameters

			const rideId = request.params['id'];

			if (!rideId) {
				return reply
					.status(HttpStatus.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HttpStatus.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.findById(rideId);

			if (!rideData) {
				return reply
					.status(HttpStatus.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HttpStatus.NOT_FOUND,
					});
			}

			//
			// Fetch the corresponding vehicle events data
			// and send it back to the client

			const standardWindowInterval = Dates.fromUnixTimestamp(rideData.start_time_scheduled).std_window;

			const simplifiedApexValidationsData = await simplifiedApexValidations.findMany({
				created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
				extra_trip_id: null,
				trip_id: rideData.trip_id,
			});

			//
			// Send the ride data back to the client

			reply.send({
				data: simplifiedApexValidationsData ?? [],
				error: null,
				statusCode: HttpStatus.OK,
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Get SimplifiedVehicleEvents by Ride ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async getVehicleEventsByRideId(request: FastifyRequest, reply: FastifyReply<SimplifiedVehicleEvent[]>) {
		try {
			//

			//
			// Validate the request parameters

			const rideId = request.params['id'];

			if (!rideId) {
				return reply
					.status(HttpStatus.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HttpStatus.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.findById(rideId);

			if (!rideData) {
				return reply
					.status(HttpStatus.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HttpStatus.NOT_FOUND,
					});
			}

			//
			// Fetch the corresponding vehicle events data
			// and send it back to the client

			const standardWindowInterval = Dates.fromUnixTimestamp(rideData.start_time_scheduled).std_window;

			const vehicleEventsData = await simplifiedVehicleEvents.findMany({
				created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
				extra_trip_id: null,
				trip_id: rideData.trip_id,
			});

			//
			// Send the ride data back to the client

			reply.send({
				data: vehicleEventsData ?? [],
				error: null,
				statusCode: HttpStatus.OK,
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Reprocess a Ride by ID.
	 * @param request The Fastify request object.
	 * @param reply The Fastify reply object.
	 */
	static async reprocessRideById(request: FastifyRequest, reply: FastifyReply<Ride>) {
		try {
			//

			//
			// Validate the request parameters

			const rideId = request.params['id'];

			if (!rideId) {
				return reply
					.status(HttpStatus.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HttpStatus.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.updateById(rideId, { system_status: 'waiting' });

			if (!rideData) {
				return reply
					.status(HttpStatus.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HttpStatus.NOT_FOUND,
					});
			}

			//
			// Send the ride data back to the client

			reply.send({
				data: rideData,
				error: null,
				statusCode: HttpStatus.OK,
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
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
					const message: HttpResponse<RideNormalized> = {
						data: databaseOperation['fullDocument'],
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
