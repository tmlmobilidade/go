/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type RolesListItem, RolesListItemSchema } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Returns all Roles sorted by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function listRolesHandler(request: FastifyRequest, reply: FastifyReply<RolesListItem[]>) {
	//

	const foundRoles = await goDb.core.roles.findMany();

	if (!foundRoles?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No roles found',
			status_code: '404',
		});
	}

	const validatedRoles = RolesListItemSchema.array().parse(foundRoles);

	return sendSuccessApiResponse(reply, validatedRoles);
}
