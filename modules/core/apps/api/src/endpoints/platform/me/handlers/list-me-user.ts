/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type MeUser } from '@tmlmobilidade/go-types-core';

/**
 * Get the current user from the session token.
 * @param request The request object
 * @param reply The reply object
 */
export async function listMeUserHandler(request: FastifyRequest, reply: FastifyReply<MeUser>) {
	//
	//
	// Reply with the already populated MeUser data from the request.

	return sendSuccessApiResponse(reply, request.me);
}
