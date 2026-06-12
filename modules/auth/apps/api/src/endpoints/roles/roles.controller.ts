/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { roles } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type CreateRoleDto, type Role, type UpdateRoleDto } from '@tmlmobilidade/types';

/* * */

export class RolesController {
	//

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

		if (!role) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error creating role');
			Logger.issue('error', error, {
				action: 'create',
				feature: 'roles',
				request,
				value: request.body,
			});
			throw error;
		}

		reply.send({ data: role, error: null, statusCode: HTTP_STATUS.CREATED });
	}

	/**
	 * Delete a user - Delete a user from the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const result = await roles.deleteById(request.params.id);
		if (!result) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error deleting role');
			Logger.issue('error', error, {
				action: 'delete',
				feature: 'roles',
				request,
				value: request.params.id,
			});
			throw error;
		}

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Get all users - Retrieve a list of all users sorted by creation date in descending order
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Role[]>) {
		const allRolesData = await roles.findMany({}, { sort: { name: 1 } });

		if (!allRolesData) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error getting roles');
			Logger.issue('error', error, {
				action: 'getAll',
				feature: 'roles',
				request,
			});
			throw error;
		}

		reply.send({ data: allRolesData, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Get user by ID - Retrieve a user by their unique identifier
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Role>) {
		const role = await roles.findById(request.params.id);

		if (!role) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Role not found');
			Logger.issue('error', error, {
				action: 'getById',
				feature: 'roles',
				request,
				value: request.params.id,
			});
			throw error;
		}

		reply.send({ data: role, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Toggles the lock status of a role by ID.
	 * @param request Fastify request containing role ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Role>) {
		await roles.toggleLockById(request.params.id);
		const foundRole = await roles.findById(request.params.id);
		if (!foundRole) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Role not found');
			Logger.issue('error', error, {
				action: 'lock',
				feature: 'roles',
				request,
				value: request.params.id,
			});
			throw error;
		}

		reply.send({ data: foundRole, error: null, statusCode: HTTP_STATUS.OK });
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

		if (!role) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error updating role');
			Logger.issue('error', error, {
				action: 'update',
				feature: 'roles',
				request,
				value: request.params.id,
			});
			throw error;
		}

		reply.send({ data: role, error: null, statusCode: HTTP_STATUS.OK });
	}
}
