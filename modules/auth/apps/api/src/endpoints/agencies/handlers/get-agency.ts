/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Agency } from '@tmlmobilidade/go-types-core';

/**
 * Returns an Agency by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function getAgencyHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Agency>) {
	const agencyData = await goDb.core.agencies.findById(request.params.id);
	if (!agencyData) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, `Error finding agency with ID ${request.params.id}`);
	}
	reply.send({ data: agencyData, error: null, statusCode: HTTP_STATUS.OK });
}
