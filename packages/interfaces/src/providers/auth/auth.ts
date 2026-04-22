/* * */

import { organizations, roles, sessions, users, verificationTokens } from '@/interfaces/index.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { generateRandomString, generateRandomToken } from '@tmlmobilidade/strings';
import { type CreateUserDto, type LoginDto, type Organization, type Permission, type Session, type User } from '@tmlmobilidade/types';
import { asyncSingletonProxy, mergeObjects } from '@tmlmobilidade/utils';
import bcrypt from 'bcryptjs';

/* * */

export const AUTH_SESSION_COOKIE_NAME = 'session_token';

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
	 * Get the organization for a user based on their session token.
	 * @param sessionToken The session token to look up.
	 * @returns The user associated with the session token.
	 * @throws An HTTP UNAUTHORIZED error code if user or session not found
	 */
	public async getOrganizationFromSessionToken(sessionToken: string): Promise<Organization> {
		// Get the user associated with the session token
		const userData = await this.getUserFromSessionToken(sessionToken);
		// Find the organization associated with the user
		const organizationData = await organizations.findOne({ _id: { $eq: userData.organization_id } });
		if (!organizationData) return undefined;
		// Return the user data to the caller
		return organizationData;
	}

	/**
	 * Get Permissions for a user based on their session token.
	 * @param sessionToken The session token.
	 * @returns The permissions that the user has.
	 */
	public async getPermissionsFromSessionToken(sessionToken: string): Promise<Permission[]> {
		// Get the user associated with the session token
		const userData = await this.getUserFromSessionToken(sessionToken);
		// Return the permissions for the user ID
		return this.getPermissionsFromUserId(userData._id);
	}

	/**
	 * Get Permissions for a user based on their user ID.
	 * @param userId The user ID (optional if sessionToken is provided).
	 * @returns The permissions that the user has.
	 */
	public async getPermissionsFromUserId(userId: string): Promise<Permission[]> {
		// Get the user associated with the session token
		const userData = await users.findById(userId);
		if (!userData) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'User not found.');
		// Get the roles assigned to the user
		const rolesData = await roles.findMany({ _id: { $in: userData.role_ids } });
		// Combine permissions from roles and user-specific permissions
		const allPermissions = [...rolesData.flatMap(role => role.permissions), ...userData.permissions];
		// Merge permissions with the same scope and action
		const permissionsMap = new Map<string, Permission>();
		for (const permission of allPermissions) {
			// Setup a unique key based on scope and action
			const key = `${permission.scope}:${permission.action}`;
			// If the permission already exists, merge them
			if (permissionsMap.has(key)) {
				// Get the existing permission
				const existingPermission = permissionsMap.get(key);
				// Merge the existing permission with the new one
				permissionsMap.set(key, mergeObjects(existingPermission, permission));
			} else {
				// Otherwise, just add the new permission
				permissionsMap.set(key, permission);
			}
		}
		// Return the merged permissions as an array
		return Array.from(permissionsMap.values());
	}

	/**
	 * Get a user object from their session token.
	 * @param sessionToken The session token to look up.
	 * @returns The user associated with the session token.
	 * @throws An HTTP UNAUTHORIZED error code if user or session not found
	 */
	public async getUserFromSessionToken(sessionToken: string): Promise<User> {
		// Find the current session in the database
		const sessionData = await sessions.findOne({ token: { $eq: sessionToken } });
		if (!sessionData) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'Session not found');
		// Find the user associated with the session
		const userData = await users.findOne({ _id: { $eq: sessionData.user_id } });
		if (!userData) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'User not found');
		// Sanitize the user data by removing sensitive fields
		userData.password_hash = undefined;
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
		// Find the user by email
		const userData = await users.findByEmail(loginDto.email, { includeUnsafeProperties: true });
		if (!userData) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'User not found');
		// Check if the password matches the stored hash
		const passwordHashMatch = await bcrypt.compare(loginDto.password, userData.password_hash ?? '');
		if (!passwordHashMatch) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'Invalid password');
		// Create a new session object if the password matches
		const newSession: Session = {
			_id: generateRandomString(),
			created_at: Dates.now('utc').unix_timestamp,
			created_by: 'system',
			expires_at: Dates.now('utc').plus({ days: 30 }).unix_timestamp,
			token: generateRandomToken(),
			updated_at: Dates.now('utc').unix_timestamp,
			updated_by: 'system',
			user_id: userData._id.toString(),
		};
		// Insert the new session into the database
		await sessions.insertOne(newSession);
		// Return the session to the caller
		return newSession;
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
	public async register(createUserDto: CreateUserDto): Promise<string> {
		// Insert the new user into the database with the provided data
		const insertNewUserResult = await users.insertOne(createUserDto);
		// Generate a random token that will be used to verify the user
		const verificationToken = generateRandomToken();
		// Insert the verification token into the database
		await verificationTokens.insertOne({
			expires_at: Dates.now('utc').plus({ days: 7 }).unix_timestamp,
			token: verificationToken,
			user_id: insertNewUserResult._id,
		});

		return verificationToken;
	}
}

/* * */

export const authProvider = asyncSingletonProxy(AuthProvider);
