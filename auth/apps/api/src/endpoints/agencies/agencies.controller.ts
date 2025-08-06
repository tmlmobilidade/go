/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { agencies } from '@tmlmobilidade/interfaces';
import { HttpException, HttpStatus } from '@tmlmobilidade/lib';
import { Agency, type CreateAgencyDto, type UpdateAgencyDto } from '@tmlmobilidade/types';

/* * */

export class AgenciesController {
	/**
	 * Create a new user - Create a new user in the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async create(request: FastifyRequest<{ Body: CreateAgencyDto }>, reply: FastifyReply<Agency>) {
		const agency = await agencies.insertOne(request.body);
		reply.send({ data: agency, error: null, statusCode: HttpStatus.CREATED });
	}

	/**
	 * Delete a user - Delete a user from the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		await agencies.deleteById(request.params.id);
		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Get all users - Retrieve a list of all users sorted by creation date in descending order
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Agency[]>) {
		const allAgencies = await agencies.findMany({}, { sort: { _id: 1 } });
		reply.send({ data: allAgencies, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Get user by ID - Retrieve a user by their unique identifier
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Agency>) {
		const agency = await agencies.findById(request.params.id);

		if (!agency) throw new HttpException(HttpStatus.NOT_FOUND, 'Agency not found');

		reply.send({ data: agency, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Update a user - Update a user in the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async update(request: FastifyRequest<{ Body: UpdateAgencyDto, Params: { id: string } }>, reply: FastifyReply<Agency>) {
		const agency = await agencies.updateById(request.params.id, request.body);
		reply.send({ data: agency, error: null, statusCode: HttpStatus.OK });
	}
}
