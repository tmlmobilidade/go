/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Organization } from '@tmlmobilidade/go-types-core';

/**
 * Toggles the lock status of an organization by ID.
 * @param request Fastify request containing organization ID in params.
 * @param reply Fastify reply.
 */
export async function lockOrganizationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Organization>) {
	return sendErrorApiResponse(reply, {
		error: 'Not implemented',
		status_code: '500',
	});
}
