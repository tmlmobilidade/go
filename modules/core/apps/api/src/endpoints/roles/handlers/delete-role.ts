/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Deletes a Role from the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function deleteRoleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	//
	// Delete the role from the database

	const deleteResult = await goDb.core.roles.deleteById(request.params.id);

	if (!deleteResult) {
		return sendErrorApiResponse(reply, {
			error: 'Error deleting role',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, undefined);
}
