/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { agencies } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { type CreateAgencyDto, type UpdateAgencyDto } from '@tmlmobilidade/types';

/* * */

export class AgenciesController {
	/**
	 * Create a new user - Create a new user in the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async create(request: FastifyRequest<{ Body: CreateAgencyDto }>, reply: FastifyReply) {
		try {
			const agency = await agencies.insertOne(request.body);
			reply.send({ data: agency, message: 'Agency created successfully' });
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Delete a user - Delete a user from the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			await agencies.deleteById(request.params.id);
			reply.send({ message: 'Agency deleted successfully' });
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Get all users - Retrieve a list of all users sorted by creation date in descending order
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply) {
		try {
			const agencyList = await agencies.findMany({}, undefined, undefined, { created_at: -1 });
			reply.send(agencyList);
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Get user by ID - Retrieve a user by their unique identifier
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const agency = await agencies.findById(request.params.id);

			if (!agency) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Agency not found' });
				return;
			}

			reply.send(agency);
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Update a user - Update a user in the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async update(request: FastifyRequest<{ Body: UpdateAgencyDto, Params: { id: string } }>, reply: FastifyReply) {
		try {
			const agency = await agencies.updateById(request.params.id, request.body);
			reply.send({ data: agency, message: 'Agency updated successfully' });
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}
}
