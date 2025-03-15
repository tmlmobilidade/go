/* * */

import { hashedShapes, rides } from '@tmlmobilidade/core/interfaces';
import { type FastifyReply, type FastifyRequest } from 'fastify';

/* * */

export const hashedShapeEndpoint = async (request: FastifyRequest, reply: FastifyReply) => {
	//

	//
	// Set default headers

	reply.header('Access-Control-Allow-Origin', '*');

	//
	// Validate the request parameters
	// and fetch the ride data

	const rideId = request.params['ride_id'];

	if (!rideId) {
		return reply.code(400).send({ error: 'Missing ride_id parameter' });
	}

	const rideData = await rides.findById(rideId);

	if (!rideData) {
		return reply.code(404).send({ error: 'Ride not found' });
	}

	//
	// Fetch the corresponding hashed shape data
	// and send it back to the client

	const hashedShapeData = await hashedShapes.findById(rideData.hashed_shape_id);

	reply.send(hashedShapeData);

	//
};
