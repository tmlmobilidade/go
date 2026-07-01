/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Ride } from '@tmlmobilidade/types';

/**
 * Reprocess a Ride by ID.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function reprocessRideById(request: FastifyRequest, reply: FastifyReply<Ride>) {
	try {
		//

		//
		// Validate the request parameters

		const rideId = request.params['id'];

		if (!rideId) {
			const error = new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing ride_id parameter.');
			Logger.issue({ context: { action: 'reprocessRideById', feature: 'rides', request, value: rideId }, level: 'error', messageOrError: error });

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

		const rideData = await rides.updateById(rideId, { system_status: 'waiting' });

		if (!rideData) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Ride not found.');
			Logger.issue({ context: { action: 'reprocessRideById', feature: 'rides', request, value: rideId }, level: 'error', messageOrError: error });

			return reply
				.status(HTTP_STATUS.NOT_FOUND)
				.send({
					data: null,
					error: 'Ride not found.',
					status: HTTP_STATUS.NOT_FOUND,
				});
		}

		//
		// Send the ride data back to the client

		reply.send({
			data: rideData,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	} catch (error) {
		reply
			.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
			.send(error);
	}
}
