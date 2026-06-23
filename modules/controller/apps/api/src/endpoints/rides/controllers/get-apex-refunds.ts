/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/go-types-apex';
import { rides, simplifiedApexOnBoardRefunds } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Get SimplifiedApexOnBoardRefunds by Ride ID.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getSimplifiedApexOnBoardRefunds(request: FastifyRequest, reply: FastifyReply<SimplifiedApexOnBoardRefund[]>) {
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

		const standardWindowInterval = Dates.fromUnixTimestamp(rideData.start_time_scheduled).std_window;

		const simplifiedApexOnBoardRefundsData = await simplifiedApexOnBoardRefunds.findMany({
			created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
			extra_trip_id: null,
			trip_id: rideData.trip_id,
		});

		//
		// Send the ride data back to the client

		reply.send({
			data: simplifiedApexOnBoardRefundsData ?? [],
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	} catch (error) {
		Logger.issue({ context: { action: 'getSimplifiedApexOnBoardRefundsByRideId', feature: 'rides', request, value: request.body }, level: 'error', messageOrError: error });
		reply
			.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
			.send(error);
	}
}
