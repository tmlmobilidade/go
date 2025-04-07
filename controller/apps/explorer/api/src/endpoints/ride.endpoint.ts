/* * */

import { rides } from '@tmlmobilidade/core/interfaces';
import { type FastifyReply, type FastifyRequest } from 'fastify';

/* * */

export const rideEndpoint = async (request: FastifyRequest, reply: FastifyReply) => {
	//

	//
	// Set default headers

	reply.header('Access-Control-Allow-Origin', request.headers.origin);
	reply.header('Access-Control-Allow-Credentials', true);

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

	reply.send(rideData || {});

	//
};
