/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { hashedTrips, rides } from '@tmlmobilidade/interfaces';
import { type HashedTrip } from '@tmlmobilidade/types';

/**
 * Get a HashedTrip by Ride ID.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getHashedTrip(request: FastifyRequest, reply: FastifyReply<HashedTrip>) {
	try {
		//

		//
		// Validate the request parameters

		const rideId = request.params['id'];

		if (!rideId) {
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
