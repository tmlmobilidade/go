/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type UsersOrganizationItem, UsersOrganizationItemSchema } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Returns all users organizations.
 * @param request The request object
 * @param reply The reply object
 */
export async function listOrganizationsHandler(request: FastifyRequest, reply: FastifyReply<UsersOrganizationItem[]>) {
	//

	const foundOrganizations = await goDb.core.organizations.findMany();

	if (!foundOrganizations?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No users organizations found',
			status_code: '404',
		});
	}

	const validatedOrganizations = UsersOrganizationItemSchema.array().parse(foundOrganizations);

	return sendSuccessApiResponse(reply, validatedOrganizations);
}
