/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance } from '@tmlmobilidade/types';

/**
 * Gets a ride acceptance by ride ID
 */
export async function getRideAcceptance(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	const rideAcceptanceData = await goDb.operation.rideAcceptances.findOne({ ride_id: request.params.id });

	if (!rideAcceptanceData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Ride acceptance not found.');
	}

	return reply.send({
		data: rideAcceptanceData,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
