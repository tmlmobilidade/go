/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateOrganizationDto, CreateOrganizationSchema, type Organization } from '@tmlmobilidade/go-types-core';

/**
 * Inserts a new organization into the database.
 * @param request The request object containing the organization data in the body.
 * @param reply The reply object used to send the response.
 */
export async function createOrganizationHandler(request: FastifyRequest<{ Body: CreateOrganizationDto }>, reply: FastifyReply<Organization>) {
	//

	const validatedOrganization = CreateOrganizationSchema.safeParse({
		...request.body,
		created_by: request.me._id,
		updated_by: request.me._id,
	});
	if (!validatedOrganization.success) {
		return sendErrorApiResponse(reply, { error: validatedOrganization.error.message, status_code: '400' });
	}

	const insertResult = await goDb.core.organizations.insertOne(validatedOrganization.data);

	return sendSuccessApiResponse(reply, insertResult);
}
