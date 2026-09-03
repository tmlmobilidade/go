/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';

/**
 * Returns all Stops sorted by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function listPatternsStopsHandler(request: FastifyRequest, reply: FastifyReply<Stop[]>) {
	//

	const foundStops = await goDb.infrastructure.stops.findMany();

	if (!foundStops?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No stops found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundStops);
}
