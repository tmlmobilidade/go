/* * */

import { roles, sessions, users, verificationTokens } from '@/interfaces/index.js';
import { sendWelcomeEmail } from '@tmlmobilidade/go-emails';
import { getAppConfig, HttpException, HttpStatus } from '@tmlmobilidade/go-lib';
import { CreateUserDto, LoginDto, OneOrTheOther, Permission, Session, User } from '@tmlmobilidade/go-types';
import { AsyncSingletonProxy, mergeObjects } from '@tmlmobilidade/go-utils';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { generateRandomString, generateRandomToken } from '@tmlmobilidade/go-utils-strings';
import bcrypt from 'bcryptjs';

/* * */

class AuthProvider {
	private static _instance: AuthProvider;

	/**
	 * Return the instance of the AuthProvider.
	 */
	public static async getInstance() {
		if (!AuthProvider._instance) {
			AuthProvider._instance = new AuthProvider();
		}
		return AuthProvider._instance;
	}

	/**
	 * Get Permissions for a user based on their session token or user_id.
	 * @param sessionToken - The session token (optional if user_id is provided)
	 * @param user_id - The user ID (optional if sessionToken is provided)
	 * @returns The permissions that the user has
	 */
	public async getPermissions<T>(params: OneOrTheOther<{ sessionToken: string }, { user_id: string }>): Promise<Permission<T>[]> {
		//

		//
		// Get the user and their roles

		let userData: User;

		if ('user_id' in params) {
			const foundUser = await users.findOne({ _id: { $eq: params.user_id } });
			if (!foundUser) {
				throw new HttpException(HttpStatus.UNAUTHORIZED, 'User not found');
			}
			userData = foundUser;
		}
		else if ('sessionToken' in params) {
			userData = await this.getUser(params.sessionToken);
		}
		else {
			throw new HttpException(HttpStatus.BAD_REQUEST, 'Either sessionToken or user_id must be provided');
		}

		const rolesData = await roles.findMany({ _id: { $in: userData.role_ids } });

		const allPermissions = [...rolesData.flatMap(role => role.permissions), ...userData.permissions] as Permission<unknown>[];

		const permissionsMap = new Map<string, Permission<unknown>>();

		for (const permission of allPermissions) {
			const key = `${permission.scope}:${permission.action}`;

			if (permissionsMap.has(key)) {
				const existingPermission = permissionsMap.get(key);

				if (!existingPermission) {
					throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Error getting permissions');
				}

				permissionsMap.set(key, mergeObjects(existingPermission, permission));
				continue;
			}

			permissionsMap.set(key, permission);
		}

		return Array.from(permissionsMap.values());
	}

	/**
	 * Gets a user by their session token.
	 * @param sessionToken The session token to look up.
	 * @returns The user associated with the session token.
	 * @throws An HTTP UNAUTHORIZED error code if user or session not found
	 */
	public async getUser(sessionToken: string): Promise<User> {
		//

		//
		// Find the current session in the database

		const sessionData = await sessions.findOne({ token: { $eq: sessionToken } });

		if (!sessionData) {
			throw new HttpException(HttpStatus.UNAUTHORIZED, 'Session not found');
		}

		//
		// Find the user associated with the session

		const userData = await users.findOne({ _id: { $eq: sessionData.user_id } });

		if (!userData) {
			throw new HttpException(HttpStatus.UNAUTHORIZED, 'User not found');
		}

		//
		// Return the user data to the caller

		return userData;
	}

	/**
	 * Login a user.
	 * @param username The username of the user
	 * @param password_hash The password hash of the user, already hashed with bcrypt in client
	 * @returns The newly created session for the logged in user
	 * @throws An HTTP error code:
	 *   - UNAUTHORIZED if user not found or password is incorrect
	 *   - INTERNAL_SERVER_ERROR if login fails
	 */
	public async login(loginDto: LoginDto): Promise<Session> {
		//

		//
		// Find the user by email

		const userData = await users.findByEmail(loginDto.email, true);

		if (!userData) {
			throw new HttpException(HttpStatus.UNAUTHORIZED, 'User not found');
		}

		//
		// Check if the password matches the stored hash

		const passwordHashMatch = await bcrypt.compare(loginDto.password, userData.password_hash ?? '');

		if (!passwordHashMatch) {
			throw new HttpException(HttpStatus.UNAUTHORIZED, 'Invalid password');
		}

		//
		// Create a new session object if the password matches

		const session: Session = {
			_id: generateRandomString(),
			created_at: Dates.now('utc').unix_timestamp,
			created_by: 'system',
			token: generateRandomToken(),
			updated_at: Dates.now('utc').unix_timestamp,
			updated_by: 'system',
			user_id: userData._id.toString(),
		};

		await sessions.insertOne(session);

		//
		// Return the session to the caller

		return session;
	}

	/**
	 * Logout a user by removing their session.
	 * @param sessionToken The session token to logout.
	 */
	public async logout(sessionToken: string): Promise<void> {
		await sessions.deleteOne({ token: { $eq: sessionToken } });
	}

	/**
	 * Register a new user.
	 * @param createUserDto The data to create the user
	 * @throws An HTTP error code:
	 *   - INTERNAL_SERVER_ERROR if user creation fails
	 */
	public async register(createUserDto: CreateUserDto): Promise<void> {
		//

		//
		// Insert the new user into the database
		// with the provided data

		const insertNewUserResult = await users.insertOne({ ...createUserDto });

		//
		// Generate a random token that will be used to verify the user

		const verificationToken = generateRandomToken();

		await verificationTokens.insertOne({
			created_by: 'system',
			expires_at: Dates.now('utc').plus({ days: 7 }).unix_timestamp,
			token: verificationToken,
			updated_by: 'system',
			user_id: insertNewUserResult._id,
		});

		//
		// Send a welcome email to the user with the verification token

		sendWelcomeEmail({
			props: {
				first_name: createUserDto.first_name,
				setup_password_link: `${getAppConfig('auth', 'frontend_url')}/verification?token=${verificationToken}`,
			},
			to: createUserDto.email,
		});
	}
}

/* * */

export const authProvider = AsyncSingletonProxy(AuthProvider);
