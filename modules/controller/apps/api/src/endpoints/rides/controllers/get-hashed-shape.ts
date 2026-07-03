/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { hashedShapes, rides } from '@tmlmobilidade/interfaces';
import { type HashedShape } from '@tmlmobilidade/types';

/**
 * Get a HashedShape by Ride ID.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getHashedShape(request: FastifyRequest, reply: FastifyReply<HashedShape>) {
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

	const hashedShapeData = await hashedShapes.findById(rideData.hashed_shape_id);

	if (!hashedShapeData) {
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
