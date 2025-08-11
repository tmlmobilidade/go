/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { agencies } from '@tmlmobilidade/interfaces';
import { HttpException, HttpStatus } from '@tmlmobilidade/lib';
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
		const allAgencies = await agencies.findMany({}, { sort: { _id: 1 } });
		reply.send({ data: allAgencies, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Returns an Agency by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Agency>) {
		const agencyData = await agencies.findById(request.params.id);
		if (!agencyData) throw new HttpException(HttpStatus.NOT_FOUND, 'Agency not found');
		reply.send({ data: agencyData, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Updates an Agency in the database
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async update(request: FastifyRequest<{ Body: UpdateAgencyDto, Params: { id: string } }>, reply: FastifyReply<Agency>) {
		const validatedAgency = UpdateAgencySchema.strip().safeParse(request.body);
		if (!validatedAgency.success) throw new HttpException(HttpStatus.BAD_REQUEST, 'Dados inválidos', validatedAgency.error);
		const updatedAgencyData = await agencies.updateById(request.params.id, validatedAgency.data);
		reply.send({ data: updatedAgencyData, error: null, statusCode: HttpStatus.OK });
	}

	//
}
