/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDB } from '@tmlmobilidade/go-interfaces-go-db';
import { enrichUserRefs } from '@tmlmobilidade/interfaces';
import { type RideAcceptance } from '@tmlmobilidade/types';

/**
 * Gets a ride acceptance by ride ID
 */
export async function getRideAcceptance(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	const rideAcceptanceData = await goDB.operation.rideAcceptances.findByRideId(request.params.id);

	if (!rideAcceptanceData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Ride acceptance not found.');
	}

	return reply.send({
		data: await enrichUserRefs(rideAcceptanceData),
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
