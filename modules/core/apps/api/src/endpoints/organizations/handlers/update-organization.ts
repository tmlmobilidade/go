/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Organization, type UpdateOrganizationDto, UpdateOrganizationSchema } from '@tmlmobilidade/go-types-core';

/**
 * Updates an Organization in the database.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function updateOrganizationHandler(request: FastifyRequest<{ Body: UpdateOrganizationDto, Params: { id: string } }>, reply: FastifyReply<Organization>) {
	// Validate the request body
	const validatedOrganization = UpdateOrganizationSchema.safeParse(request.body);
	if (!validatedOrganization.success) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, validatedOrganization.error.message);
	}
	// Set the updated_by field to the current user's id
	request.body.updated_by = request.me._id;
	// Update the organization in the database
	const updatedOrganizationData = await goDb.core.organizations.updateById(request.params.id, validatedOrganization.data);
	reply.send({ data: updatedOrganizationData, error: null, statusCode: HTTP_STATUS.OK });
}
