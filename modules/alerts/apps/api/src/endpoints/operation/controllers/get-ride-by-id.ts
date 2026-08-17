/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { ridesProvider } from '@tmlmobilidade/go-providers-operation';
import { type Ride } from '@tmlmobilidade/go-types-operation';

/**
 * Get a ride by its ID.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getRideById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Ride>) {
	//

	//
	// Validate the request parameters

	if (!request.params.id) {
		return reply
			.status(HTTP_STATUS.BAD_REQUEST)
			.send({
				data: null,
				error: 'Missing ride_id parameter.',
				status: HTTP_STATUS.BAD_REQUEST,
			});
	}

	//
	// Fetch the ride data by ride ID
	// and send it back to the client

	const rideData = await ridesProvider.findRideById(request.params.id);

	reply.send({
		data: rideData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
