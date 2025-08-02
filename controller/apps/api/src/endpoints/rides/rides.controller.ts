/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { hashedShapes, hashedTrips, rides, simplifiedApexValidations, vehicleEvents } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { HashedShape, HashedTrip, type Ride, SimplifiedApexValidation, validateUnixTimestamp, VehicleEvent } from '@tmlmobilidade/types';
import { Dates, HttpResponse } from '@tmlmobilidade/utils';
import { type WebSocket } from 'ws';

/* * */

export class RidesController {
	//

	/**
	 * Get a batch of Rides.
	 * @param request
	 * @param reply
	 */
	static async getBatch(request: FastifyRequest, reply: FastifyReply<Ride[]>) {
		try {
			//

			const requestBody = JSON.parse(request.body as string) as {
				agency?: string[]
				date_end: number
				date_start: number
				simple_three_vehicle_events?: string[]
			};

			//
			// If no query parameters are provided, return a batch of rides from 1 hour ago until 1 hour later.

			const validatedStartDate = validateUnixTimestamp(requestBody.date_start);
			const validatedEndDate = validateUnixTimestamp(requestBody.date_end);

			//
			// Fetch rides from the database

			const ridesBatch = await rides.findMany(
				{
					'agency_id': { $in: requestBody.agency ?? [] },
					'analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade': { $in: requestBody.simple_three_vehicle_events ?? [] },
					'start_time_scheduled': { $gte: validatedStartDate, $lte: validatedEndDate },
				},
				{ limit: 5000 },
			);

			reply.send({
				data: ridesBatch,
				error: null,
				statusCode: HttpStatus.OK,
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send({
					data: null,
					error: error.message,
					status: HttpStatus.INTERNAL_SERVER_ERROR,
				});
			//
		}
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
					const message: HttpResponse<Ride> = {
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
