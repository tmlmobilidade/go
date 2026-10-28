/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type AgencyOrganization, AgencyOrganizationSchema } from '@tmlmobilidade/go-types-core';

/**
 * Returns organization names and agency memberships for platform filters.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function listAgencyOrganizationsHandler(request: FastifyRequest, reply: FastifyReply<AgencyOrganization[]>) {
	//

	//
	// Fetch only the organization metadata used by agency filters

	const organizations = await goDb.core.organizations.findMany({}, {
		projection: { _id: 1, agency_ids: 1, long_name: 1, short_name: 1 },
	});

	//
	// Parse the response, including empty memberships for older organizations

	return sendSuccessApiResponse(reply, AgencyOrganizationSchema.array().parse(organizations));
}
