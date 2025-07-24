/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { authProvider, roles, users } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { type CreateUserDto, type UpdateUserDto } from '@tmlmobilidade/types';

/* * */

const COOKIE_NAME = 'session_token';

/* * */

export class UsersController {
	/**
	 * Create a new user - Create a new user in the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async create(request: FastifyRequest<{ Body: CreateUserDto }>, reply: FastifyReply) {
		try {
			await authProvider.register(request.body);
			reply.send({ message: 'Confirmation email sent' });
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
			await users.deleteById(request.params.id);
			reply.send({ message: 'User deleted successfully' });
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
			const userList = await users.findMany({}, undefined, undefined, {
				created_at: -1,
			});
			reply.send(userList);
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
			const user = await users.findById(request.params.id);

			if (!user) {
				reply
					.status(HttpStatus.NOT_FOUND)
					.send({ message: 'User not found' });
				return;
			}

			reply.send(user);
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}

	/**
	 * Get current user - Get the current user from the session token
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async getMe(request: FastifyRequest, reply: FastifyReply) {
		const session_token = request.cookies[COOKIE_NAME];

		const user = await authProvider.getUser(session_token);
		const role = await roles.findMany({ _id: { $in: user.role_ids } });

		user.permissions = [...role.flatMap(role => role.permissions), ...user.permissions];

		return reply.status(HttpStatus.OK).send(user);
	}

	/**
	 * Update a user - Update a user in the database
	 * @param {FastifyRequest} request - The request object
	 * @param {FastifyReply} reply - The reply object
	 */
	static async update(request: FastifyRequest<{ Body: UpdateUserDto, Params: { id: string } }>, reply: FastifyReply) {
		try {
			const user = await users.updateById(
				request.params.id,
				request.body,
			);
			reply.send({ data: user, message: 'User updated successfully' });
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send(error);
		}
	}
}
