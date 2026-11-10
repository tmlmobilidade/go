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
	const organizationData = await goDb.core.organizations.findById(request.params.id);
	if (!organizationData) {
		return sendErrorApiResponse(reply, { error: 'Organization not found', status_code: '404' });
	}
	return sendSuccessApiResponse(reply, organizationData);
}
