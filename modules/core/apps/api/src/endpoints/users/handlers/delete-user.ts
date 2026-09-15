/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Deletes a User from the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function deleteUserHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	//
	// Delete the user from the database

	const deleteResult = await goDb.core.users.deleteById(request.params.id);

	if (!deleteResult) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to delete user',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, undefined);
}
