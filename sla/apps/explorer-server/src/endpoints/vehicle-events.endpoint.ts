/* * */

import { rides, vehicleEvents } from '@tmlmobilidade/core/interfaces';
import { FastifyReply } from 'fastify';

export const vehicleEventsEndpoint = async (request, reply: FastifyReply) => {
	//

	reply.header('Access-Control-Allow-Origin', '*');

	const rideId = request.params['ride_id'];

	if (!rideId) {
		return reply.code(400).send({ error: 'Missing ride_id parameter' });
	}

	//

	const rideData = await rides.findById(rideId);

	if (!rideData) {
		return reply.code(404).send({ error: 'Ride not found' });
	}

	//

	const vehicleEventsCollection = await vehicleEvents.getCollection();

	const vehicleEventsData = await vehicleEventsCollection
		.find({
			extra_trip_id: null,
			operational_date: rideData.operational_date,
			trip_id: rideData.trip_id,
		})
		.toArray();

	reply.send(vehicleEventsData || []);

	//
};
