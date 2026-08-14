/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/fastify';
import { type ControllerRidesDetailRideItem, getControllerRidesDetailRide } from '@tmlmobilidade/go-controller-pckg-queries';

/**
 * Get a ride by its ID.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getRideById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<ControllerRidesDetailRideItem>) {
	//

	//
	// Validate the request parameters

	if (!request.params.id) {
		return sendErrorApiResponse(reply, {
			error: 'Missing ride "id" parameter.',
			status_code: '400',
		});
	}

	//
	// Fetch the ride data by ID
	// and send it back to the client

	const result = await getControllerRidesDetailRide(request.params.id);

	return sendSuccessApiResponse(reply, result);
}
