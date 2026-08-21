/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Delete a role from the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function deleteRoleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	const result = await goDb.core.roles.deleteById(request.params.id);
	if (!result) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error deleting role');
	}

	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
