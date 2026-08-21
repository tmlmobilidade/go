/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Agency, type UpdateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/go-types-core';

/**
 * Updates an Agency in the database
 * @param request The request object
 * @param reply The reply object
 */
export async function updateAgencyHandler(request: FastifyRequest<{ Body: UpdateAgencyDto, Params: { id: string } }>, reply: FastifyReply<Agency>) {
	// Validate the request body
	const validatedAgency = UpdateAgencySchema.safeParse(request.body);
	if (!validatedAgency.success) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, validatedAgency.error.message);
	}
	// Set the updated_by field to the current user's id
	validatedAgency.data.updated_by = request.me._id;
	// Update the agency in the database
	const updatedAgencyData = await goDb.core.agencies.updateById(request.params.id, validatedAgency.data);
	reply.send({ data: updatedAgencyData, error: null, statusCode: HTTP_STATUS.OK });
}
