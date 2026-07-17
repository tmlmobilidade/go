/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { goDB } from '@tmlmobilidade/go-interfaces-go-db';
import { generateRandomString, generateRandomToken } from '@tmlmobilidade/strings';
import { type CreateUserDto, type LoginDto, type Organization, type Permission, type Session, type User } from '@tmlmobilidade/types';
import { asyncSingletonProxy, mergeObjects } from '@tmlmobilidade/utils';
import bcrypt from 'bcryptjs';

/* * */

export const AUTH_SESSION_COOKIE_NAME = 'session_token';

/* * */

class AuthProviderClass {
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
		const organizationData = await goDB.core.organizations.findOne({ _id: { $eq: userData.organization_id } });
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
		const userData = await goDB.core.users.findById(userId);
		if (!userData) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'User not found.');

		const rolesData = await goDB.core.roles.findMany({ _id: { $in: userData.role_ids } });
		const allPermissions = [...rolesData.flatMap(role => role.permissions), ...userData.permissions];

		const permissionsMap = new Map<string, Permission>();
		for (const permission of allPermissions) {
			const key = `${permission.scope}:${permission.action}`;
			if (permissionsMap.has(key)) {
				const existingPermission = permissionsMap.get(key)!;
				permissionsMap.set(key, mergeObjects(existingPermission, permission));
			} else {
				permissionsMap.set(key, permission);
			}
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
		const sessionData = await goDB.core.sessions.findOne({ token: { $eq: sessionToken } });
		if (!sessionData) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'Session not found');

		const userData = await goDB.core.users.findOne({ _id: { $eq: sessionData.user_id } });
		if (!userData) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'User not found');

		(userData as any).password_hash = undefined;
		return userData;
	}

	/**
	 * Login a user.
	 * @param loginDto The login credentials (email and password).
	 * @returns The newly created session for the logged in user.
	 * @throws An HTTP UNAUTHORIZED error code if user not found or password is incorrect.
	 */
	async login(loginDto: LoginDto): Promise<Session> {
		const userData = await goDB.core.users.findOne({ email: { $eq: loginDto.email } });
		if (!userData) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'User not found');

		const passwordHashMatch = await bcrypt.compare(loginDto.password, (userData as any).password_hash ?? '');
		if (!passwordHashMatch) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'Invalid password');

		const createdSession = await goDB.core.sessions.insertOne({
			_id: generateRandomString(),
			created_at: Dates.now('utc').unix_timestamp,
			created_by: 'system',
			expires_at: Dates.now('utc').plus({ days: 30 }).unix_timestamp,
			token: generateRandomToken(),
			updated_at: Dates.now('utc').unix_timestamp,
			updated_by: 'system',
			user_id: userData._id.toString(),
		});

		return createdSession;
	}

	/**
	 * Logout a user by removing their session.
	 * @param sessionToken The session token to logout.
	 */
	async logout(sessionToken: string): Promise<void> {
		await goDB.core.sessions.deleteOne({ token: { $eq: sessionToken } });
	}

	/**
	 * Register a new user.
	 * @param createUserDto The data to create the user.
	 * @returns The verification token for email verification.
	 */
	async register(createUserDto: CreateUserDto): Promise<string> {
		const insertNewUserResult = await goDB.core.users.insertOne(createUserDto as any);

		const verificationToken = generateRandomToken();
		await goDB.core.verificationTokens.insertOne({
			expires_at: Dates.now('utc').plus({ days: 7 }).unix_timestamp,
			token: verificationToken,
			user_id: insertNewUserResult._id,
		});

		return verificationToken;
	}
}

/* * */

export const authProvider = asyncSingletonProxy(AuthProviderClass);
