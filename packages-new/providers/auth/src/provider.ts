/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateUserDto, type Organization, type User } from '@tmlmobilidade/go-types-core';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { asyncSingletonProxy } from '@tmlmobilidade/go-utils-exec';
import { generateRandomToken } from '@tmlmobilidade/strings';
import { mergeObjects } from '@tmlmobilidade/utils';

/* * */

export const AUTH_SESSION_COOKIE_NAME = 'session_token';

/* * */

class AuthProviderClass {
	//

	private static _instance: AuthProviderClass;

	private constructor() {}

	public static async getInstance() {
		if (!AuthProviderClass._instance) {
			AuthProviderClass._instance = new AuthProviderClass();
		}
		return AuthProviderClass._instance;
	}

	/**
	 * Get the organization for a user based on their session token.
	 * @param sessionToken The session token to look up.
	 * @returns The organization associated with the session token.
	 */
	async getOrganizationFromSessionToken(sessionToken: string): Promise<Organization | undefined> {
		const userData = await this.getUserFromSessionToken(sessionToken);
		const organizationData = await goDb.core.organizations.findOne({ _id: { $eq: userData.organization_id } });
		if (!organizationData) return undefined;
		return organizationData;
	}

	/**
	 * Get permissions for a user based on their session token.
	 * @param sessionToken The session token.
	 * @returns The permissions that the user has.
	 */
	async getPermissionsFromSessionToken(sessionToken: string): Promise<Permission[]> {
		const userData = await this.getUserFromSessionToken(sessionToken);
		return this.getPermissionsFromUserId(userData._id);
	}

	/**
	 * Get permissions for a user based on their user ID.
	 * @param userId The user ID.
	 * @returns The permissions that the user has.
	 * @throws An HTTP UNAUTHORIZED error code if user not found.
	 */
	async getPermissionsFromUserId(userId: string): Promise<Permission[]> {
		//

		//
		// Get the user data

		const userData = await goDb.core.users.findById(userId);
		if (!userData) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'User not found.');

		//
		// Get the roles data

		const rolesData = await goDb.core.roles.findMany({ _id: { $in: userData.role_ids } });
		const allPermissions = [...rolesData.flatMap(role => role.permissions), ...userData.permissions];

		//
		// Merge the permissions

		const permissionsMap = new Map<string, Permission>();

		for (const permission of allPermissions) {
			const key = `${permission.scope}:${permission.action}`;
			const foundPermission = permissionsMap.get(key);
			if (foundPermission) permissionsMap.set(key, mergeObjects(foundPermission, permission));
			else permissionsMap.set(key, permission);
		}

		return Array.from(permissionsMap.values());
	}

	/**
	 * Get a user object from their session token.
	 * @param sessionToken The session token to look up.
	 * @returns The user associated with the session token.
	 * @throws An HTTP UNAUTHORIZED error code if user or session not found.
	 */
	async getUserFromSessionToken(sessionToken: string): Promise<User> {
		// Get the session data
		const sessionData = await goDb.core.sessions.findOne({
			expires_at: { $gt: Dates.now('utc').unix_milliseconds },
			token: { $eq: sessionToken },
		});
		if (!sessionData) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'Session not found');
		// Get the user data
		const userData = await goDb.core.users.findOne({ _id: { $eq: sessionData.user_id } });
		if (!userData) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'User not found');
		// Delete the password hash from the user data
		userData.password_hash = null;
		// Return the user data
		return userData;
	}

	/**
	 * Logout a user by removing their session.
	 * @param sessionToken The session token to logout.
	 */
	async logout(sessionToken: string): Promise<void> {
		await goDb.core.sessions.deleteOne({ token: { $eq: sessionToken } });
	}

	/**
	 * Register a new user.
	 * @param createUserDto The data to create the user.
	 * @returns The verification token for email verification.
	 */
	async register(createUserDto: CreateUserDto): Promise<string> {
		// Insert the new user
		const insertNewUserResult = await goDb.core.users.insertOne(createUserDto);
		// Generate the verification token
		const verificationToken = generateRandomToken();
		// Insert the verification token
		await goDb.core.verificationTokens.insertOne({
			expires_at: Dates.now('utc').plus({ days: 7 }).unix_milliseconds,
			token: verificationToken,
			user_id: insertNewUserResult._id,
		});
		// Return the verification token
		return verificationToken;
	}
}

/* * */

export const authProvider = asyncSingletonProxy(AuthProviderClass);
