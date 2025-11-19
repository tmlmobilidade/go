/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { authProvider, users } from '@tmlmobilidade/interfaces';
import { type CreateUserDto, type UpdateUserDto, UpdateUserSchema, type User } from '@tmlmobilidade/types';

/* * */

const COOKIE_NAME = 'session_token';

/* * */

export class UsersController {
	//

	/**
	 * Create a new user - Create a new user in the database
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async create(request: FastifyRequest<{ Body: CreateUserDto }>, reply: FastifyReply<void>) {
		//

		//
		// Set the created_by and updated_by fields to the current user's id
		request.body.created_by = request.me._id;
		request.body.updated_by = request.me._id;

		//
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
	 * Get the current user from the session token.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getMe(request: FastifyRequest, reply: FastifyReply<User>) {
		//

		//
		// Extract the session token from authentication cookie

		const sessionToken = request.cookies[COOKIE_NAME];

		if (!sessionToken) {
			throw new HttpException(HttpStatus.UNAUTHORIZED, 'Session token is missing');
		}

		//
		// Retrieve user data using the session token.
		// If the user is not found, log out the session token
		// and return an error response. Do this to force the user
		// to log in again and to avoid an infinite loop of trying
		// to get user data with an invalid session token.

		let userData: User;

		try {
			userData = await authProvider.getUser(sessionToken);
			if (!userData) throw new Error('User not found');
		}
		catch (error) {
			console.error('Error retrieving user data:', error);
			await authProvider.logout(sessionToken);
			return reply
				.setCookie(COOKIE_NAME, '', {
					httpOnly: true,
					maxAge: 0,
					path: '/',
					sameSite: 'lax',
					secure: true,
				})
				.send({
					data: undefined,
					error: null,
					statusCode: HttpStatus.OK,
				});
		}

		//
		// Retrieve roles and permissions for the user
		// and merge them into the user data.
		userData.permissions = await authProvider.getPermissions({ sessionToken });

		//
		// Send the user data back in the response.

		return reply.send({ data: userData, error: null, statusCode: HttpStatus.OK });

		//
	}

	/**
	 * Update a user - Update a user in the database
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async update(request: FastifyRequest<{ Body: UpdateUserDto, Params: { id: string } }>, reply: FastifyReply<User>) {
		//

		//
		// Set the updated_by field to the current user's id

		request.body.updated_by = request.me._id;

		//
		// Validate the request body against the UpdateUserDto schema

		const validatedUserData = UpdateUserSchema.safeParse(request.body);

		if (!validatedUserData.success) {
			throw new HttpException(HttpStatus.BAD_REQUEST, 'Invalid user data', validatedUserData.error.errors);
		}

		//
		// Update the user in the database

		const user = await users.updateById(request.params.id, validatedUserData.data);

		//
		// Send the updated user data back in the response

		reply.send({ data: user, error: null, statusCode: HttpStatus.OK });

		//
	}

	/**
	 * Get current user - Get the current user from the session token
	 * @param request The request object
	 * @param reply The reply object
	*/
	static async updateMe(request: FastifyRequest<{ Body: UpdateUserDto }>, reply: FastifyReply<User>) {
		const session_token = request.cookies[COOKIE_NAME];
		const user = await authProvider.getUser(session_token);
		const updatedUser = await users.updateById(user._id, request.body);
		reply.send({ data: updatedUser, error: null, statusCode: HttpStatus.OK });
	}
}
