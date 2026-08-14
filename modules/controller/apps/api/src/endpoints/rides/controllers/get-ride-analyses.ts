/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/fastify';
import { type ControllerRidesDetailRideAnalysesItem, getControllerRidesDetailRideAnalyses } from '@tmlmobilidade/go-controller-pckg-queries';

/**
 * Get the analyses for a ride by its ID.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getRideAnalyses(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<ControllerRidesDetailRideAnalysesItem>) {
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
	// Fetch the ride analyses by ID
	// and send it back to the client

	const result = await getControllerRidesDetailRideAnalyses(request.params.id);

	return sendSuccessApiResponse(reply, result);
}
