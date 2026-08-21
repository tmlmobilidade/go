/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Agency } from '@tmlmobilidade/go-types-core';

/**
 * Returns all Agencies sorted by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<Agency[]>) {
	const allAgencies = await goDb.core.agencies.findMany({}, { projection: { validation_rules: 0 }, sort: { _id: 1 } });
	if (!allAgencies) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error getting agencies from database');
	}
	reply.send({ data: allAgencies, error: null, statusCode: HTTP_STATUS.OK });
}
