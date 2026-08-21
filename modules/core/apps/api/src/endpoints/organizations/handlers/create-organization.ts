/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { CreateOrganizationSchema, type Organization } from '@tmlmobilidade/go-types-core';

/**
 * Inserts a new organization into the database.
 * @param request The request object containing the organization data in the body.
 * @param reply The reply object used to send the response.
 */
export async function createOrganizationHandler(request: FastifyRequest<{ Body: Omit<Organization, '_id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by'> }>, reply: FastifyReply<Organization>) {
	// Validate the request body
	const validatedOrganization = CreateOrganizationSchema.safeParse(request.body);
	if (!validatedOrganization.success) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, validatedOrganization.error.message);
	}
	// Set the updated_by field to the current user's id
	validatedOrganization.data.updated_by = request.me._id;
	// Update the organization in the database
	const result = await goDb.core.organizations.insertOne(validatedOrganization.data);
	reply.send({ data: result, error: null, statusCode: HTTP_STATUS.CREATED }).status(HTTP_STATUS.CREATED);
}
