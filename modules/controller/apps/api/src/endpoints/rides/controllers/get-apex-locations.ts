/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { simplifiedApexLocationsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type SimplifiedApexLocation } from '@tmlmobilidade/go-types-apex';
import { rides, simplifiedApexLocations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Get SimplifiedApexLocations by Ride ID.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getSimplifiedApexLocations(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<SimplifiedApexLocation[]>) {
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

		const rideData = await rides.findById(request.params.id);

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

		const standardWindowInterval = Dates.fromUnixTimestamp(rideData.start_time_scheduled).std_window;

		let simplifiedApexLocationsData: SimplifiedApexLocation[];

		if (['41', '42', '43', '44'].includes(rideData.agency_id)) {
			simplifiedApexLocationsData = await simplifiedApexLocations.findMany({
				created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
				extra_trip_id: null,
				trip_id: rideData.trip_id,
			});
		} else {
			simplifiedApexLocationsData = await simplifiedApexLocationsNew.select(
				'*',
				`created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`,
				{ 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id },
			);
		}

		//
		// Send the ride data back to the client

		reply.send({
			data: simplifiedApexLocationsData ?? [],
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	} catch (error) {
		Logger.issue({ context: { action: 'getSimplifiedApexLocationsByRideId', feature: 'rides', request, value: request.body }, level: 'error', messageOrError: error });

		reply
			.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
			.send(error);
	}
}
