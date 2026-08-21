/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type User } from '@tmlmobilidade/go-types-core';

/**
 * Retrieve a list of all users sorted by creation date in descending order.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function listUsersHandler(request: FastifyRequest, reply: FastifyReply<User[]>) {
	const foundUsers = await goDb.core.users.findMany({}, { sort: { created_at: -1 } });
	if (!foundUsers) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to get users');
	}

	reply.send({ data: foundUsers, error: null, statusCode: HTTP_STATUS.OK });
}
