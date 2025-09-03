/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { AggregationPipeline, hashedShapes, hashedTrips, rides, simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations, vehicleEvents } from '@tmlmobilidade/interfaces';
import { ALLOW_ALL_FLAG, HttpStatus, Permissions } from '@tmlmobilidade/lib';
import { normalizeRide, RideNormalized } from '@tmlmobilidade/sae-controller-ride-normalized';
import { GetRidesBatchQuery, GetRidesBatchQuerySchema, type HashedShape, type HashedTrip, Permission, type Ride, RidePermission, type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation, type VehicleEvent } from '@tmlmobilidade/types';
import { Dates, getPermission, HttpResponse, validateQueryParams } from '@tmlmobilidade/utils';
import { type WebSocket } from 'ws';

/* * */

export class RidesController {
	//

	/**
	 * Gets a batch of Rides built with an aggregation pipeline.
	 */
	static async getBatch(request: FastifyRequest<{ Querystring: GetRidesBatchQuery }>, reply: FastifyReply<RideNormalized[]>) {
		//
		const parsedQuery = validateQueryParams<GetRidesBatchQuery>(request.query, GetRidesBatchQuerySchema);

		const pipeline: AggregationPipeline<Ride> = [];

		//
		// 1. Match rides between start and end date
		pipeline.push({ $match: { start_time_scheduled: { $gte: parsedQuery.date_start, $lte: parsedQuery.date_end } } });

		//

		// 2. Filter rides by line ID & stop ID
		if (parsedQuery.line_ids) {
			pipeline.push({ $match: { $in: { line_id: parsedQuery.line_ids } } });
		}

		// 3. Filter rides by agency ID
		if (parsedQuery.agency_ids) {
			pipeline.push({ $match: { agency_id: { $in: parsedQuery.agency_ids } } });
		}

		//
		// 3. If search is provided, match rides by ID
		const search = parsedQuery.search?.trim() ?? '';
		if (search) {
			const keywords = search.split(/\s+/).map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
			const pattern = keywords.map(k => `(?=.*${k})`).join('') + '.*';
			pipeline.push({
				$match: { _id: { $options: 'i', $regex: pattern } },
			});
		}

		//
		// 4. Filter rides based on permissions for the current user
		const ridePermission: Permission<RidePermission> = getPermission(request.permissions, Permissions.rides.scope, Permissions.rides.actions.read);

		if (ridePermission?.resource) {
			// 4.1. Filter rides based on agency IDs
			if (ridePermission.resource.agency_ids && !ridePermission.resource.agency_ids.includes(ALLOW_ALL_FLAG)) {
				pipeline.push({ $match: { agency_id: { $in: ridePermission.resource.agency_ids } } });
			}
		}

		//
		// 5. Filter by analysis
		const analysisFilters: { field: keyof GetRidesBatchQuery, path: string }[] = [
			{ field: 'analysis_ended_at_last_stop_grade', path: 'analysis.ENDED_AT_LAST_STOP.grade' },
			{ field: 'analysis_expected_apex_validation_interval', path: 'analysis.EXPECTED_APEX_VALIDATION_INTERVAL.grade' },
			{ field: 'analysis_simple_three_vehicle_events_grade', path: 'analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade' },
		];

		analysisFilters.forEach(({ field, path }) => parsedQuery[field] && pipeline.push({ $match: { [path]: { $in: parsedQuery[field] } } }));

		//
		// 5. Add a list of stop IDs to each ride based on the Shape Trip associated to the Ride
		pipeline.push(
			{ $lookup: { as: 'shape_details', foreignField: '_id', from: 'hashed_trips', localField: 'hashed_trip_id' } },
			{ $unwind: '$shape_details' },
			{ $addFields: { stop_ids: '$shape_details.path.stop_id' } },
			{ $project: { shape_details: 0 } },
			{ $sort: { start_time_scheduled: 1 } },
		);

		//
		// 6. Filter rides by stop ID
		if (parsedQuery.stop_ids) {
			pipeline.push({ $match: { stop_ids: { $in: parsedQuery.stop_ids } } });
		}

		//
		// 7. Final pipeline stages
		pipeline.push({ $limit: 2000 }, { $sort: { start_time_scheduled: 1 } });

		//
		// 8. Fetch rides from the database
		const ridesBatch = await rides.aggregate(pipeline);

		//
		// 9. Normalize the rides
		let normalizedRidesBatch = ridesBatch.map(ride => normalizeRide(ride));

		//
		// 10. Filter by statuses
		if (parsedQuery.delay_statuses) {
			normalizedRidesBatch = normalizedRidesBatch.filter(ride => parsedQuery.delay_statuses.includes(ride.delay_status));
		}
		if (parsedQuery.operational_statuses) {
			normalizedRidesBatch = normalizedRidesBatch.filter(ride => parsedQuery.operational_statuses.includes(ride.operational_status));
		}
		if (parsedQuery.seen_statuses) {
			normalizedRidesBatch = normalizedRidesBatch.filter(ride => parsedQuery.seen_statuses.includes(ride.seen_status));
		}

		//
		// Send the response
		reply.send({
			data: normalizedRidesBatch ?? [],
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

	/**
	 * Get a Ride by ID.
	 * @param request
	 * @param reply
	 * @returns
	 */
	static async getHashedShapeByRideId(request: FastifyRequest, reply: FastifyReply<HashedShape>) {
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
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Get a Ride by ID.
	 * @param request
	 * @param reply
	 * @returns
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
	 * @param request
	 * @param reply
	 * @returns
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
	 * Get a Ride by ID.
	 * @param request
	 * @param reply
	 * @returns
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
	 * Get a Ride by ID.
	 * @param request
	 * @param reply
	 * @returns
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
	 * Get a Ride by ID.
	 * @param request
	 * @param reply
	 * @returns
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
	 * Get a Ride by ID.
	 * @param request
	 * @param reply
	 * @returns
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
	 * Get a Ride by ID.
	 * @param request
	 * @param reply
	 * @returns
	 */
	static async getVehicleEventsByRideId(request: FastifyRequest, reply: FastifyReply<VehicleEvent[]>) {
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

			const vehicleEventsData = await vehicleEvents.findMany({
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
	 * Get a Ride by ID.
	 * @param request
	 * @param reply
	 * @returns
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
	 * @param socket
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
