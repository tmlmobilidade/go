/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type UsersListItem, UsersListItemSchema } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Returns all Users sorted by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function listUsersHandler(request: FastifyRequest, reply: FastifyReply<UsersListItem[]>) {
	//

	const foundUsers = await goDb.core.users.findMany();

	if (!foundUsers?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No users found',
			status_code: '404',
		});
	}

	const validatedUsers = UsersListItemSchema.array().parse(foundUsers);

	return sendSuccessApiResponse(reply, validatedUsers);
}
