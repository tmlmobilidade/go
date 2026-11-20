/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type OrganizationsListItem, OrganizationsListItemSchema } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Returns all Organizations sorted alphabetically by name.
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

	const validatedOrganizations = OrganizationsListItemSchema.array().parse(foundOrganizations)
		.sort((a, b) => a.long_name.localeCompare(b.long_name, 'pt', { sensitivity: 'base' }) || a._id.localeCompare(b._id));

	return sendSuccessApiResponse(reply, validatedOrganizations);
}
