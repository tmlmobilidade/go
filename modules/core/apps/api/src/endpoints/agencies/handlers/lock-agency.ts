/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Agency } from '@tmlmobilidade/go-types-core';

/**
 * Toggles the lock status of an agency by ID.
 * @param request Fastify request containing agency ID in params.
 * @param reply Fastify reply.
 */
export async function lockAgencyHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Agency>) {
	return sendErrorApiResponse(reply, {
		error: 'Not implemented',
		status_code: '500',
	});
}
