/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { authProvider, roles, users } from '@tmlmobilidade/interfaces';
import { HttpException, HttpStatus } from '@tmlmobilidade/lib';
import { type CreateUserDto, type UpdateUserDto, User } from '@tmlmobilidade/types';

/* * */

const COOKIE_NAME = 'session_token';

/* * */

export class UsersController {
	/**
	 * Create a new user - Create a new user in the database
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async create(request: FastifyRequest<{ Body: CreateUserDto }>, reply: FastifyReply<void>) {
		await authProvider.register(request.body);
		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Delete a user - Delete a user from the database
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		await users.deleteById(request.params.id);
		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Get all users - Retrieve a list of all users sorted by creation date in descending order
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<User[]>) {
		const userList = await users.findMany({}, { sort: { created_at: -1 } });
		reply.send({ data: userList, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Get user by ID - Retrieve a user by their unique identifier
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<User>) {
		const user = await users.findById(request.params.id);

		if (!user) throw new HttpException(HttpStatus.NOT_FOUND, 'User not found');

		reply.send({ data: user, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Get current user - Get the current user from the session token
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getMe(request: FastifyRequest, reply: FastifyReply<User>) {
		const session_token = request.cookies[COOKIE_NAME];

		const user = await authProvider.getUser(session_token);
		const role = await roles.findMany({ _id: { $in: user.role_ids } });

		user.permissions = [...role.flatMap(role => role.permissions), ...user.permissions];

		return reply.send({ data: user, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Update a user - Update a user in the database
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async update(request: FastifyRequest<{ Body: UpdateUserDto, Params: { id: string } }>, reply: FastifyReply<User>) {
		const user = await users.updateById(request.params.id, request.body);
		reply.send({ data: user, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Get current user - Get the current user from the session token
	 * @param request The request object
	 * @param reply The reply object
	*/
	static async updateMe(request: FastifyRequest<{ Body: UpdateUserDto, Params: { themeId: string } }>) {
		const session_token = request.cookies[COOKIE_NAME];
		const user = await authProvider.getUser(session_token);
		console.log('request.body', request.body);
		// For now, update only the theme_id
		await users.updateById(user._id, { theme_id: request.body.theme_id });
	}
}
