/* * */

import { HTTP_STATUS, HttpException, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { sendWelcomeEmail } from '@tmlmobilidade/emails';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { AUTH_SESSION_COOKIE_NAME, authProvider, organizations, users } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type CreateUserDto, type SimplifiedUser, type UpdateUserDto, UpdateUserSchema, type User } from '@tmlmobilidade/types';

/* * */

export class UsersController {
	//

	/**
	 * Create a new user in the database.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async create(request: FastifyRequest<{ Body: CreateUserDto }>, reply: FastifyReply<User>) {
		// Set the created_by and updated_by fields to the current user's id
		request.body.created_by = request.me._id;
		request.body.updated_by = request.me._id;
		// Register the new user using the auth provider
		const verificationToken = await authProvider.register(request.body);

		if (!verificationToken) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to register user');
			Logger.issue('error', error, {
				action: 'create',
				feature: 'users',
				request,
				value: request.body,
			});
			throw error;
		}

		// Send a welcome email to the user with the verification token
		await sendWelcomeEmail({
			data: {
				firstName: request.body.first_name,
				resetPasswordUrl: `${PAGE_ROUTES.auth.CHANGE_PASSWORD_LIST}?token=${verificationToken}&email=${encodeURIComponent(request.body.email)}`,
			},
			to: request.body.email,
		});

		// Fetch the newly created user to ensure it was created successfully
		// and send a response back to the client
		const newUser = await users.findByEmail(request.body.email);
		reply.send({ data: newUser, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Delete a user from the database.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const result = await users.deleteById(request.params.id);
		if (!result) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete user');
			Logger.issue('error', error, {
				action: 'delete',
				feature: 'users',
				request,
				value: request.params.id,
			});
			throw error;
		}

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieve a list of all users sorted by creation date in descending order.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<User[]>) {
		const foundUsers = await users.findMany({}, { sort: { created_at: -1 } });
		if (!foundUsers) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to get users');
			Logger.issue('error', error, {
				action: 'getAll',
				feature: 'users',
				request,
			});
			throw error;
		}

		reply.send({ data: foundUsers, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieve a user by their unique identifier.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<User>) {
		const foundUser = await users.findById(request.params.id);
		if (!foundUser) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');
			Logger.issue('error', error, {
				action: 'getById',
				feature: 'users',
				request,
				value: request.params.id,
			});
			throw error;
		}

		reply.send({ data: foundUser, error: null, statusCode: HTTP_STATUS.OK });
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

		const sessionToken = request.cookies[AUTH_SESSION_COOKIE_NAME];

		//
		// Retrieve user data using the session token.
		// If the user is not found, log out the session token
		// and return an error response. Do this to force the user
		// to log in again and to avoid an infinite loop of trying
		// to get user data with an invalid session token.

		let userData: User;

		try {
			userData = await authProvider.getUserFromSessionToken(sessionToken);
			if (!userData) {
				const error = new Error('User not found');
				Logger.issue('error', error, {
					action: 'getMe',
					feature: 'users',
					request,
				});
				throw error;
			}
		} catch (error) {
			Logger.issue('error', error, {
				action: 'getMe',
				feature: 'users',
				request,
			});
			await authProvider.logout(sessionToken);
			return reply
				.setCookie(AUTH_SESSION_COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'lax', secure: true })
				.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
		}

		//
		// Retrieve roles and permissions for the user
		// and merge them into the user data.

		userData.permissions = await authProvider.getPermissionsFromSessionToken(sessionToken);

		//
		// Send the user data back in the response.

		reply.send({ data: userData, error: null, statusCode: HTTP_STATUS.OK });

		//
		// Add seen_last_at for this user asynchronously

		await users.updateById(userData._id, { seen_last_at: Dates.now('Europe/Lisbon').unix_timestamp });

		//
	}

	/**
	 * Returns a simplified User by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getSimplifiedById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<SimplifiedUser>) {
		// Find the user by ID
		const userData = await users.findById(request.params.id);
		if (!userData) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');
			Logger.issue('error', error, {
				action: 'getSimplifiedById',
				feature: 'users',
				request,
				value: request.params.id,
			});
			throw error;
		}

		// Find the organization data associated with the user
		const organizationData = await organizations.findById(userData.organization_id);
		if (!organizationData) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
			Logger.issue('error', error, {
				action: 'getSimplifiedById',
				feature: 'users',
				request,
				value: request.params.id,
			});
			throw error;
		}

		// Simplify the user data by selecting only specific fields
		const simplifiedUserData: SimplifiedUser = {
			_id: userData._id,
			first_name: userData.first_name,
			last_name: userData.last_name,
			organization_id: userData.organization_id,
			organization_name: organizationData.long_name,
			seen_last_at: userData.seen_last_at,
		};
		// Send the simplified user data in the response
		reply.send({ data: simplifiedUserData, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Toggles the lock status of a user by ID.
	 * @param request Fastify request containing user ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<User>) {
		await users.toggleLockById(request.params.id);

		const foundUser = await users.findById(request.params.id);
		if (!foundUser) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');
			Logger.issue('error', error, {
				action: 'lock',
				feature: 'users',
				request,
				value: request.params.id,
			});
			throw error;
		}

		reply.send({ data: foundUser, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Update a user in the database.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async update(request: FastifyRequest<{ Body: UpdateUserDto, Params: { id: string } }>, reply: FastifyReply<User>) {
		// Set the updated_by field to the current user id
		request.body.updated_by = request.me._id;
		// Validate the request body against the UpdateUserDto schema
		const validatedUserData = UpdateUserSchema.safeParse(request.body);
		if (!validatedUserData.success) {
			const error = new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid user data', validatedUserData.error.errors);
			Logger.issue('error', error, {
				action: 'update',
				feature: 'users',
				request,
				value: request.params.id,
			});
			throw error;
		}

		// Remove password field if not provided to avoid
		// overwriting existing password with undefined
		if (!validatedUserData.data.password_hash) delete validatedUserData.data.password_hash;
		// Update the user in the database
		const updateResult = await users.updateById(request.params.id, validatedUserData.data);
		// Send the updated user data back in the response
		reply.send({ data: updateResult, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Get the current user from the session token.
	 * @param request The request object.
	 * @param reply The reply object.
	*/
	static async updateMe(request: FastifyRequest<{ Body: UpdateUserDto }>, reply: FastifyReply<User>) {
		const sessionToken = request.cookies[AUTH_SESSION_COOKIE_NAME];
		const userData = await authProvider.getUserFromSessionToken(sessionToken);

		// For now, only the preferences field is allowed to be updated by the current user
		const updatedUser = await users.updateById(userData._id, { preferences: request.body.preferences });
		if (!updatedUser) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update user');
			Logger.issue('error', error, {
				action: 'updateMe',
				feature: 'users',
				request,
				value: userData._id,
			});
			throw error;
		}

		reply.send({ data: updatedUser, error: null, statusCode: HTTP_STATUS.OK });
	}
}
