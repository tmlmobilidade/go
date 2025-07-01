/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { roles } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { type CreateRoleDto, type UpdateRoleDto } from '@tmlmobilidade/types';

/* * */

export class RolesController {
	/**
	 * Create a new user - Create a new user in the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async create(request: FastifyRequest<{ Body: CreateRoleDto }>, reply: FastifyReply) {
		try {
			const role = await roles.insertOne(request.body);
			reply.send({ data: role, message: 'Role created successfully' });
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
			await roles.deleteById(request.params.id);
			reply.send({ message: 'Role deleted successfully' });
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
			const roleList = await roles.findMany({}, undefined, undefined, { created_at: -1 });
			reply.send(roleList);
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
			const role = await roles.findById(request.params.id);

			if (!role) {
				reply.status(HttpStatus.NOT_FOUND).send({ message: 'Role not found' });
				return;
			}

			reply.send(role);
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
	static async update(request: FastifyRequest<{ Body: UpdateRoleDto, Params: { id: string } }>, reply: FastifyReply) {
		try {
			const role = await roles.updateById(request.params.id, request.body);
			reply.send({ data: role, message: 'Role updated successfully' });
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}
}
