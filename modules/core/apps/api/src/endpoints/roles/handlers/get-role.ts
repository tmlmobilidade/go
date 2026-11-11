/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Role } from '@tmlmobilidade/go-types-core';

/**
 * Get a role by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function getRoleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Role>) {
	const role = await goDb.core.roles.findById(request.params.id);

	if (!role) {
		return sendErrorApiResponse(reply, { error: 'Role not found', status_code: '404' });
	}

	return sendSuccessApiResponse(reply, role);
}
