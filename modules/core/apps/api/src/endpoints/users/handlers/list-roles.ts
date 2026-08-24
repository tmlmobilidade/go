/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type UsersRoleItem, UsersRoleItemSchema } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Returns all users roles.
 * @param request The request object
 * @param reply The reply object
 */
export async function listRolesHandler(request: FastifyRequest, reply: FastifyReply<UsersRoleItem[]>) {
	//

	const foundRoles = await goDb.core.roles.findMany();

	if (!foundRoles?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No users roles found',
			status_code: '404',
		});
	}

	const validatedRoles = UsersRoleItemSchema.array().parse(foundRoles);

	return sendSuccessApiResponse(reply, validatedRoles);
}
