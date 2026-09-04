/* * */

import { generateStopId } from '@/utils/generate-stop-id.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type StopId } from '@tmlmobilidade/go-types-infrastructure';

/**
 * Generates and retrieves a new unique Stop ID
 * that does not conflict with existing IDs or deleted CM Stops.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function getValidIdHandler(request: FastifyRequest, reply: FastifyReply<StopId>) {
	//

	const newStopId = await generateStopId();

	if (!newStopId) {
		return sendErrorApiResponse(reply, {
			error: 'Can not generate a new stop ID',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, newStopId);
}
