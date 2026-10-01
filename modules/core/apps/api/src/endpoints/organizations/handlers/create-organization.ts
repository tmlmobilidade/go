/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Organization } from '@tmlmobilidade/go-types-core';

/**
 * Inserts a new organization into the database.
 * @param request The request object containing the organization data in the body.
 * @param reply The reply object used to send the response.
 */
export async function createOrganizationHandler(request: FastifyRequest<{ Body: Omit<Organization, '_id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by'> }>, reply: FastifyReply<Organization>) {
	//

	const insertResult = await goDb.core.organizations.insertOne({
		...request.body,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	return sendSuccessApiResponse(reply, insertResult);
}
