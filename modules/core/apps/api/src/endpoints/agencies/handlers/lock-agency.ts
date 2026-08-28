/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Agency } from '@tmlmobilidade/go-types-core';

/**
 * Toggles the lock status of an agency by ID.
 * @param request Fastify request containing agency ID in params.
 * @param reply Fastify reply.
 */
export async function lockAgencyHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Agency>) {
	await goDb.core.agencies.toggleLockById(request.params.id);
	const foundAgency = await goDb.core.agencies.findById(request.params.id);
	if (!foundAgency) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, `Error finding agency with ID ${request.params.id}`);
	}
	reply.send({ data: foundAgency, error: null, statusCode: HTTP_STATUS.OK });
}
