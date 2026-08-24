/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type User } from '@tmlmobilidade/go-types-core';

/**
 * Toggles the lock status of a user by ID.
 * @param request Fastify request containing user ID in params.
 * @param reply Fastify reply.
 */
export async function lockUserHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<User>) {
	await goDb.core.users.toggleLockById(request.params.id);

	const foundUser = await goDb.core.users.findById(request.params.id);
	if (!foundUser) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');
	}

	reply.send({ data: foundUser, error: null, statusCode: HTTP_STATUS.OK });
}
