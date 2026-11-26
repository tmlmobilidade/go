/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Permission } from '@tmlmobilidade/go-types-permissions';

/**
 * Get the current user from the session token.
 * @param request The request object
 * @param reply The reply object
 */
export async function listMePermissionsHandler(request: FastifyRequest, reply: FastifyReply<Permission[]>) {
	//

	//
	// Reply with the already populated MeUser data from the request.

	return sendSuccessApiResponse(reply, request.permissions);
}
