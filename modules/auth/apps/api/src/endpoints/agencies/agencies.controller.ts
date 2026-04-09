/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { agencies } from '@tmlmobilidade/interfaces';
import { type Agency, type UpdateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/types';

/* * */

export class AgenciesController {
	//

	/**
	 * Returns all Agencies sorted by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Agency[]>) {
		const allAgencies = await agencies.findMany({}, { projection: { validation_rules: 0 }, sort: { _id: 1 } });
		reply.send({ data: allAgencies, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns an Agency by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Agency>) {
		const agencyData = await agencies.findById(request.params.id);
		if (!agencyData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Agency not found');
		reply.send({ data: agencyData, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Toggles the lock status of an agency by ID.
	 * @param request Fastify request containing agency ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Agency>) {
		await agencies.toggleLockById(request.params.id);
		const foundAgency = await agencies.findById(request.params.id);
		if (!foundAgency) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Agency not found');
		reply.send({ data: foundAgency, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Updates an Agency in the database
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async update(request: FastifyRequest<{ Body: UpdateAgencyDto, Params: { id: string } }>, reply: FastifyReply<Agency>) {
		// Validate the request body
		const validatedAgency = UpdateAgencySchema.safeParse(request.body);
		if (!validatedAgency.success) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Dados inválidos', validatedAgency.error);
		// Set the updated_by field to the current user's id
		validatedAgency.data.updated_by = request.me._id;
		// Update the agency in the database
		const updatedAgencyData = await agencies.updateById(request.params.id, validatedAgency.data);
		reply.send({ data: updatedAgencyData, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
}
