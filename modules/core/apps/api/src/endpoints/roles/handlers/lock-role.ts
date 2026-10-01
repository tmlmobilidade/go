/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Role } from '@tmlmobilidade/go-types-core';

/**
 * Toggles the lock status of a role by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function lockRoleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Role>) {
	return sendErrorApiResponse(reply, {
		error: 'Not implemented',
		status_code: '500',
	});
}
