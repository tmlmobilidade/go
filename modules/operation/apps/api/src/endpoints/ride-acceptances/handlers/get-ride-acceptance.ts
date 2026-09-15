/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';

/**
 * Gets a ride acceptance by ride ID
 * @param request Fastify request containing ride ID in params
 * @param reply Fastify reply
 */
export async function getRideAcceptanceHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
	//

	//
	// Get the Ride Acceptance from the database

	const rideAcceptanceData = await goDb.operation.rideAcceptances.findById(request.params.id);

	if (!rideAcceptanceData) {
		return sendErrorApiResponse(reply, {
			error: 'Ride acceptance not found.',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, rideAcceptanceData);
}
