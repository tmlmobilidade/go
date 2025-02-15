/* * */

import { apexT11, rides } from '@tmlmobilidade/core/interfaces';
import { type FastifyReply, type FastifyRequest } from 'fastify';

/* * */

export const apexT11Endpoint = async (request: FastifyRequest, reply: FastifyReply) => {
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
	// Fetch the corresponding Apex T11 data
	// and send it back to the client

	const apexT11Collection = await apexT11.getCollection();

	const apexT11Data = await apexT11Collection
		.find({
			extra_trip_id: null,
			operational_date: rideData.operational_date,
			trip_id: rideData.trip_id,
		})
		.toArray();

	reply.send(apexT11Data || []);

	//
};
