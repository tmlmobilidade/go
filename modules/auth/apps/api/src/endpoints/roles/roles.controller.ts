/* * */

import { type FastifyReply, type FastifyRequest } from '@go/connectors-fastify';
import { roles } from '@go/interfaces';
import { HttpException, HttpStatus } from '@go/lib';
import { type CreateRoleDto, type Role, type UpdateRoleDto } from '@go/types';

/* * */

export class RolesController {
	/**
	 * Create a new user - Create a new user in the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async create(request: FastifyRequest<{ Body: CreateRoleDto }>, reply: FastifyReply<Role>) {
		//

		//
		// Set the created_by and updated_by fields to the current user's id
		request.body.created_by = request.me._id;
		request.body.updated_by = request.me._id;

		const role = await roles.insertOne(request.body);
		reply.send({ data: role, error: null, statusCode: HttpStatus.CREATED });
	}

	/**
	 * Delete a user - Delete a user from the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		await roles.deleteById(request.params.id);
		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Get all users - Retrieve a list of all users sorted by creation date in descending order
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Role[]>) {
		const allRolesData = await roles.findMany({}, { sort: { name: 1 } });
		reply.send({ data: allRolesData, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Get user by ID - Retrieve a user by their unique identifier
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Role>) {
		const role = await roles.findById(request.params.id);

		if (!role) throw new HttpException(HttpStatus.NOT_FOUND, 'Role not found');

		reply.send({ data: role, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Update a user - Update a user in the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async update(request: FastifyRequest<{ Body: UpdateRoleDto, Params: { id: string } }>, reply: FastifyReply<Role>) {
		//

		//
		// Set the updated_by field to the current user's id
		request.body.updated_by = request.me._id;

		const role = await roles.updateById(request.params.id, request.body);
		reply.send({ data: role, error: null, statusCode: HttpStatus.OK });
	}
}
