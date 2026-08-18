/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { ridesProvider } from '@tmlmobilidade/go-providers-operation';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

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

		const updateResult = await ridesProvider.updateRideById(rideId, { processing_status: 'waiting' });

		reply.send({
			data: updateResult,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	} catch (error) {
		reply
			.status(error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR)
			.send(error);
	}
}
