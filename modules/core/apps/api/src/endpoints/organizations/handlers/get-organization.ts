/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Organization } from '@tmlmobilidade/go-types-core';

/**
 * Returns an Organization by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function getOrganizationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Organization>) {
	//

	//
	// Get the organization data

	const foundOrganization = await goDb.core.organizations.findById(request.params.id);

	if (!foundOrganization) {
		return sendErrorApiResponse(reply, {
			error: `Organization with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundOrganization);
}
