/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
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
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
	}
	reply.send({ data: organizationData, error: null, statusCode: HTTP_STATUS.OK });
}
