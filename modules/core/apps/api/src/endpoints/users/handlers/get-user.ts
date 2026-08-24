/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type User } from '@tmlmobilidade/go-types-core';

/**
 * Retrieve a user by their unique identifier.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getUserHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<User>) {
	const foundUser = await goDb.core.users.findById(request.params.id);
	reply.send({ data: foundUser, error: null, statusCode: HTTP_STATUS.OK });
}
