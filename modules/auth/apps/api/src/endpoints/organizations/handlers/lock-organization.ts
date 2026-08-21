/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Organization } from '@tmlmobilidade/go-types-core';

/**
 * Toggles the lock status of an organization by ID.
 * @param request Fastify request containing organization ID in params.
 * @param reply Fastify reply.
 */
export async function lockOrganizationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Organization>) {
	await goDb.core.organizations.toggleLockById(request.params.id);
	const foundOrganization = await goDb.core.organizations.findById(request.params.id);
	if (!foundOrganization) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
	}
	reply.send({ data: foundOrganization, error: null, statusCode: HTTP_STATUS.OK });
}
