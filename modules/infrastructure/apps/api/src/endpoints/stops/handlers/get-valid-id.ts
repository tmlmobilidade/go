/* * */

import { generateStopId } from '@/utils/generate-stop-id.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type StopId } from '@tmlmobilidade/go-types-infrastructure';

/**
 * Generates and returns a new unique Stop ID
 * that does not conflict with existing IDs or deleted CM Stops.
 * @param request The request object
 * @param reply The reply object
 */
export async function getValidIdHandler(request: FastifyRequest, reply: FastifyReply<StopId>) {
	//

	//
	// Generate a new stop ID

	const newStopId = await generateStopId();

	if (!newStopId) {
		return sendErrorApiResponse(reply, {
			error: 'Can not generate a new stop ID',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, newStopId);
}
