/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type OrganizationsListItem, OrganizationsListItemSchema } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Returns all Organizations sorted by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function listOrganizationsHandler(request: FastifyRequest, reply: FastifyReply<OrganizationsListItem[]>) {
	//

	const foundOrganizations = await goDb.core.organizations.findMany();

	if (!foundOrganizations?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No organizations found',
			status_code: '404',
		});
	}

	const validatedOrganizations = OrganizationsListItemSchema.array().parse(foundOrganizations);

	return sendSuccessApiResponse(reply, validatedOrganizations);
}
