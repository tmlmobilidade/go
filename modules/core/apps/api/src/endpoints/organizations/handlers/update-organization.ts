/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Organization, type UpdateOrganizationDto, UpdateOrganizationSchema } from '@tmlmobilidade/go-types-core';

/**
 * Updates an Organization in the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function updateOrganizationHandler(request: FastifyRequest<{ Body: UpdateOrganizationDto, Params: { id: string } }>, reply: FastifyReply<Organization>) {
	//

	//
	// Validate the request body

	const validatedOrganization = UpdateOrganizationSchema.safeParse({
		...request.body,
		updated_by: request.me._id,
	});

	if (!validatedOrganization.success) {
		return sendErrorApiResponse(reply, {
			error: validatedOrganization.error.message,
			status_code: '400',
		});
	}

	//
	// Update the organization in the database

	const updatedOrganizationData = await goDb.core.organizations.updateById(request.params.id, validatedOrganization.data);

	return sendSuccessApiResponse(reply, updatedOrganizationData);
}
