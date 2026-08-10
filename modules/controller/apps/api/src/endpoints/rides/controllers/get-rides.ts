/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { ridesProvider } from '@tmlmobilidade/go-providers-operation';
import { type Ride } from '@tmlmobilidade/go-types-operation';

/**
 * Get rides by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getRides(request: FastifyRequest, reply: FastifyReply<Ride[]>) {
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
		// Fetch the hashed trip data by ride ID
		// and send it back to the client

		const hashedTripData = await ridesProvider.findHashedTripByRideId(rideId);

		reply.send({
			data: hashedTripData,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	} catch (error) {
		reply
			.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
			.send(error);
	}
}
