/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Delete a role from the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function deleteRoleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	const result = await goDb.core.roles.deleteById(request.params.id);
	if (!result) return sendErrorApiResponse(reply, { error: 'Error deleting role', status_code: '500' });
	return sendSuccessApiResponse(reply, undefined);
}
