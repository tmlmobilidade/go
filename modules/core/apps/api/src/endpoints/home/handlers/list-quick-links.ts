/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type HomeQuickLink } from '@tmlmobilidade/go-types-core';

/**
 * Returns the quick links of the current user's organization.
 * @param request The request object
 * @param reply The reply object
 */
export async function listQuickLinksHandler(request: FastifyRequest, reply: FastifyReply<HomeQuickLink[]>) {
	//

	//
	// Get the organization ID for the current user

	const organizationId = request.me?.organization_id;

	if (!organizationId) {
		return sendErrorApiResponse(reply, {
			error: 'User has no organization ID in me context',
			status_code: '400',
		});
	}

	//
	// Get the organization data

	const foundOrganization = await goDb.core.organizations.findById(organizationId);

	if (!foundOrganization) {
		return sendErrorApiResponse(reply, {
			error: 'Organization not found',
			status_code: '404',
		});
	}

	//
	// Return the quick links

	return sendSuccessApiResponse(reply, foundOrganization.home_links);
}
