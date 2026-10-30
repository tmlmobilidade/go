/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type User } from '@tmlmobilidade/go-types-core';

import { toPublicUser } from '../public-user.js';

/**
 * Retrieve a user by their unique identifier.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getUserHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Omit<User, 'password_hash'>>) {
	const foundUser = await goDb.core.users.findById(request.params.id);
	reply.send({ data: foundUser ? toPublicUser(foundUser) : null, error: null, statusCode: HTTP_STATUS.OK });
}
