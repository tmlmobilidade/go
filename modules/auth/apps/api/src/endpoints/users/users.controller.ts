/* * */

import { HTTP_STATUS, HttpException, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { sendWelcomeEmail } from '@tmlmobilidade/go-providers-emails';
import { type CreateUserDto, type SimplifiedUser, type UpdateUserDto, UpdateUserSchema, type User } from '@tmlmobilidade/go-types-core';

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
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to register user');
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
		const newUser = await goDb.core.users.findOne({ email: request.body.email });
		reply.send({ data: newUser, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Delete a user from the database.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const result = await goDb.core.users.deleteById(request.params.id);
		if (!result) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete user');
		}

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieve a list of all users sorted by creation date in descending order.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<User[]>) {
		const foundUsers = await goDb.core.users.findMany({}, { sort: { created_at: -1 } });
		if (!foundUsers) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to get users');
		}

		reply.send({ data: foundUsers, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieve a user by their unique identifier.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<User>) {
		const foundUser = await goDb.core.users.findById(request.params.id);
		reply.send({ data: foundUser, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Returns a simplified User by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getSimplifiedById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<SimplifiedUser>) {
		// Find the user by ID
		const userData = await goDb.core.users.findById(request.params.id);
		if (!userData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');
		}

		// Find the organization data associated with the user
		const organizationData = await goDb.core.organizations.findById(userData.organization_id);
		if (!organizationData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Organization not found');
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
		await goDb.core.users.toggleLockById(request.params.id);

		const foundUser = await goDb.core.users.findById(request.params.id);
		if (!foundUser) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'User not found');
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
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid user data', validatedUserData.error.errors);
		}

		// Remove password field if not provided to avoid
		// overwriting existing password with undefined
		if (!validatedUserData.data.password_hash) delete validatedUserData.data.password_hash;
		// Update the user in the database
		const updateResult = await goDb.core.users.updateById(request.params.id, validatedUserData.data);
		// Send the updated user data back in the response
		reply.send({ data: updateResult, error: null, statusCode: HTTP_STATUS.OK });
	}
}
