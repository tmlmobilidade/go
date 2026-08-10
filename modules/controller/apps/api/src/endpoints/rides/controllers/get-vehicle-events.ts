/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { ridesProvider } from '@tmlmobilidade/go-providers-operation';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Get SimplifiedVehicleEvents by Ride ID.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getSimplifiedVehicleEvents(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<SimplifiedVehicleEvent[]>) {
	try {
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
		// Fetch the ride data from the database

		const rideData = await ridesProvider.findRideById(request.params.id);

		//
		// Fetch the simplified vehicle events data by ride ID
		// and send it back to the client

		const standardWindowInterval = Dates.fromUnixTimestamp(rideData.start_time_scheduled).std_window;

		const vehicleEventsData = await labDb.operation.simplifiedVehicleEvents.select(
			'*',
			`created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4 AND extra_trip_id IS NULL`,
			{ 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id },
		);

		//
		// Send the ride data back to the client

		reply.send({
			data: vehicleEventsData ?? [],
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	} catch (error) {
		Logger.issue({ context: { action: 'getVehicleEventsByRideId', feature: 'rides', request, value: request.body }, level: 'error', messageOrError: error });
		reply
			.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
			.send(error);
	}
}
