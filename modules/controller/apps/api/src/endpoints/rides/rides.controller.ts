/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { hashedShapes, hashedTrips, rides, simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations, simplifiedVehicleEvents } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type HashedShape, type HashedTrip, type Ride, type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/* * */

export class RidesController {
	//

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
			const error = new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing ride_id parameter.');
			Logger.issue('error', error, {
				action: 'getHashedShapeByRideId',
				feature: 'rides',
				request,
			});

			return reply
				.status(HTTP_STATUS.BAD_REQUEST)
				.send({
					data: null,
					error: 'Missing ride_id parameter.',
					status: HTTP_STATUS.BAD_REQUEST,
				});
		}

		//
		// Fetch the ride data from the database

		const rideData = await rides.findById(rideId);

		if (!rideData) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Ride not found.');
			Logger.issue('error', error, {
				action: 'getHashedShapeByRideId',
				feature: 'rides',
				request,
				value: rideId,
			});

			return reply
				.status(HTTP_STATUS.NOT_FOUND)
				.send({
					data: null,
					error: 'Ride not found.',
					status: HTTP_STATUS.NOT_FOUND,
				});
		}

		//
		// Fetch the corresponding vehicle events data
		// and send it back to the client

		const hashedShapeData = await hashedShapes.findById(rideData.hashed_shape_id);

		if (!hashedShapeData) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'HashedShape not found.');
			Logger.issue('error', error, {
				action: 'getHashedShapeByRideId',
				feature: 'rides',
				request,
				value: rideData.hashed_shape_id,
			});

			return reply
				.status(HTTP_STATUS.NOT_FOUND)
				.send({
					data: null,
					error: 'HashedShape not found.',
					status: HTTP_STATUS.NOT_FOUND,
				});
		}

		//
		// Send the ride data back to the client

		reply.send({
			data: hashedShapeData,
			error: null,
			statusCode: HTTP_STATUS.OK,
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
				const error = new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing ride_id parameter.');
				Logger.issue('error', error, {
					action: 'getHashedTripByRideId',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HTTP_STATUS.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.findById(rideId);

			if (!rideData) {
				const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Ride not found.');
				Logger.issue('error', error, {
					action: 'getHashedTripByRideId',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HTTP_STATUS.NOT_FOUND,
					});
			}

			//
			// Fetch the corresponding vehicle events data
			// and send it back to the client

			const hashedTripData = await hashedTrips.findById(rideData.hashed_trip_id);

			if (!hashedTripData) {
				const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'HashedTrip not found.');
				Logger.issue('error', error, {
					action: 'getHashedTripByRideId',
					feature: 'rides',
					request,
					value: rideData.hashed_trip_id,
				});

				return reply
					.status(HTTP_STATUS.NOT_FOUND)
					.send({
						data: null,
						error: 'HashedTrip not found.',
						status: HTTP_STATUS.NOT_FOUND,
					});
			}

			//
			// Send the ride data back to the client

			reply.send({
				data: hashedTripData,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			reply
				.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
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
				const error = new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing ride_id parameter.');
				Logger.issue('error', error, {
					action: 'getSimplifiedApexLocationsByRideId',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HTTP_STATUS.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.findById(rideId);

			if (!rideData) {
				const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Ride not found.');
				Logger.issue('error', error, {
					action: 'getSimplifiedApexLocationsByRideId',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HTTP_STATUS.NOT_FOUND,
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
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.issue('error', error, {
				action: 'getSimplifiedApexLocationsByRideId',
				feature: 'rides',
				request,
				value: request.body,
			});

			reply
				.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
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
				const error = new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing ride_id parameter.');
				Logger.issue('error', error, {
					action: 'getSimplifiedApexOnBoardRefundsByRideId',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HTTP_STATUS.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.findById(rideId);

			if (!rideData) {
				const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Ride not found.');
				Logger.issue('error', error, {
					action: 'getSimplifiedApexOnBoardRefundsByRideId',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HTTP_STATUS.NOT_FOUND,
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
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.issue('error', error, {
				action: 'getSimplifiedApexOnBoardRefundsByRideId',
				feature: 'rides',
				request,
				value: request.body,
			});

			reply
				.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
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
				const error = new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing ride_id parameter.');
				Logger.issue('error', error, {
					action: 'getSimplifiedApexOnBoardSalesByRideId',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HTTP_STATUS.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.findById(rideId);

			if (!rideData) {
				const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Ride not found.');
				Logger.issue('error', error, {
					action: 'getSimplifiedApexOnBoardSalesByRideId',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HTTP_STATUS.NOT_FOUND,
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
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.issue('error', error, {
				action: 'getSimplifiedApexOnBoardSalesByRideId',
				feature: 'rides',
				request,
				value: request.body,
			});

			reply
				.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
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
				const error = new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing ride_id parameter.');
				Logger.issue('error', error, {
					action: 'getSimplifiedApexValidationsByRideId',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HTTP_STATUS.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.findById(rideId);

			if (!rideData) {
				const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Ride not found.');
				Logger.issue('error', error, {
					action: 'getSimplifiedApexValidationsByRideId',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HTTP_STATUS.NOT_FOUND,
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
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.issue('error', error, {
				action: 'getSimplifiedApexValidationsByRideId',
				feature: 'rides',
				request,
				value: request.body,
			});

			reply
				.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
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
				const error = new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing ride_id parameter.');
				Logger.issue('error', error, {
					action: 'getVehicleEventsByRideId',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HTTP_STATUS.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.findById(rideId);

			if (!rideData) {
				const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Ride not found.');
				Logger.issue('error', error, {
					action: 'getVehicleEventsByRideId',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HTTP_STATUS.NOT_FOUND,
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
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.issue('error', error, {
				action: 'getVehicleEventsByRideId',
				feature: 'rides',
				request,
				value: request.body,
			});

			reply
				.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
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
				const error = new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing ride_id parameter.');
				Logger.issue('error', error, {
					action: 'reprocessRideById',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.BAD_REQUEST)
					.send({
						data: null,
						error: 'Missing ride_id parameter.',
						status: HTTP_STATUS.BAD_REQUEST,
					});
			}

			//
			// Fetch the ride data from the database

			const rideData = await rides.updateById(rideId, { system_status: 'waiting' });

			if (!rideData) {
				const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Ride not found.');
				Logger.issue('error', error, {
					action: 'reprocessRideById',
					feature: 'rides',
					request,
					value: rideId,
				});

				return reply
					.status(HTTP_STATUS.NOT_FOUND)
					.send({
						data: null,
						error: 'Ride not found.',
						status: HTTP_STATUS.NOT_FOUND,
					});
			}

			//
			// Send the ride data back to the client

			reply.send({
				data: rideData,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		} catch (error) {
			Logger.issue('error', error, {
				action: 'reprocessRideById',
				feature: 'rides',
				request,
				value: request.body,
			});

			reply
				.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	//
}
