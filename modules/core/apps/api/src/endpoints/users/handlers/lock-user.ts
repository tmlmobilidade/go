/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type User } from '@tmlmobilidade/go-types-core';

/**
 * Toggles the lock status of a user by ID.
 * @param request Fastify request containing user ID in params.
 * @param reply Fastify reply.
 */
export async function lockUserHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<User>) {
	return sendErrorApiResponse(reply, {
		error: 'Not implemented',
		status_code: '500',
	});
}
