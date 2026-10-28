/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Stop, StopIdSchema } from '@tmlmobilidade/go-types-infrastructure';

/* * */

/**
 * Returns a stop by ID for pattern shape editing.
 * @param request The request object
 * @param reply The reply object
 */
export async function getPatternStopHandler(request: FastifyRequest<{ Params: { stopId: string } }>, reply: FastifyReply<Stop>) {
	//

	const parsedStopId = StopIdSchema.safeParse(request.params.stopId);
	if (!parsedStopId.success) {
		return sendErrorApiResponse(reply, { error: parsedStopId.error.message, status_code: '400' });
	}

	const foundStop = await goDb.infrastructure.stops.findById(parsedStopId.data);
	if (!foundStop) {
		return sendErrorApiResponse(reply, { error: 'Stop not found.', status_code: '404' });
	}

	return sendSuccessApiResponse(reply, foundStop);
}
