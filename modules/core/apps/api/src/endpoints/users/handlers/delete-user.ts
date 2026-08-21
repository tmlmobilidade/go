/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Delete a user from the database.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function deleteUserHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	const result = await goDb.core.users.deleteById(request.params.id);
	if (!result) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete user');
	}

	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
