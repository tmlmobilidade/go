/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Organization } from '@tmlmobilidade/go-types-core';

/**
 * Returns all Organizations sorted by ID.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function listOrganizationsHandler(request: FastifyRequest, reply: FastifyReply<Organization[]>) {
	const allOrganizations = await goDb.core.organizations.findMany({}, { sort: { _id: 1 } });
	reply.send({ data: allOrganizations, error: null, statusCode: HTTP_STATUS.OK });
}
