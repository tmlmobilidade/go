/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateUserDto, CreateUserSchema, PermissionCatalog, type UpdateUserDto, UpdateUserSchema, type User, type User_UNSAFE } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, type FindOptions, type IndexDescription, type WithId } from 'mongodb';
import { z } from 'zod';

/* * */

interface SafeUserOptions {
	includeUnsafeProperties: boolean
}

/* * */

class UsersClass extends MongoCollectionClass<User_UNSAFE, CreateUserDto, UpdateUserDto> {
	private static _instance: UsersClass;
	protected override createSchema: z.ZodSchema = CreateUserSchema;
	protected override updateSchema: z.ZodSchema = UpdateUserSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!UsersClass._instance) {
			const instance = new UsersClass();
			await instance.connect();
			UsersClass._instance = instance;
		}
		return UsersClass._instance;
	}

	/**
	 * Finds a user document by its email.
	 * @param email The email of the user to find.
	 * @param options.includeUnsafeProperties Whether to include the password hash in the result.
	 * @returns A promise that resolves to the matching user document or null if not found.
	 */
	async findByEmail(email: string, options: SafeUserOptions & { includeUnsafeProperties: true }): Promise<null | WithId<User_UNSAFE>>;
	async findByEmail(email: string, options?: SafeUserOptions): Promise<null | WithId<User>>;
	async findByEmail(email: string, options?: SafeUserOptions) {
		const foundUser = await this.mongoCollection.findOne({ email: { $eq: email } });
		if (!foundUser) return null;
		if (options?.includeUnsafeProperties) return foundUser;
		return this.sanitizeUser(foundUser);
	}

	/**
	 * Finds a user document by its ID.
	 * @param id The ID of the user document to find
	 * @param includeUnsafeProperties Whether to include the password hash in the result
	 * @returns A promise that resolves to the matching user document or null if not found
	 */
	override async findById(id: string, options: FindOptions & { includeUnsafeProperties: true }): Promise<null | WithId<User_UNSAFE>>;
	override async findById(id: string): Promise<null | WithId<User>>;
	override async findById(id: string, options?: FindOptions & SafeUserOptions) {
		const foundUser = await this.mongoCollection.findOne({ _id: id }, options);
		if (!foundUser) return null;
		if (options?.includeUnsafeProperties) return foundUser;
		return this.sanitizeUser(foundUser);
	}

	/**
	 * Finds users by their organization code.
	 * @param code The code of the organization to find users for.
	 * @param includeUnsafeProperties Whether to include the password hash in the result.
	 * @returns A promise that resolves to the matching user documents or null if not found.
	 */
	async findByOrganization(id: string) {
		const foundUsers = await this.mongoCollection.find({ organization_id: { $in: [id] } }).toArray();
		return foundUsers.map(item => this.sanitizeUser(item));
	}

	/**
	 * Finds a user by their role.
	 * @param role The role of the user to find.
	 * @returns A promise that resolves to the matching user document or null if not found.
	 */
	async findByRole(role: string) {
		const foundUsers = await this.mongoCollection.find({ role_ids: { $in: [role] } }).toArray();
		return foundUsers.map(item => this.sanitizeUser(item));
	}

	/**
	 * Finds multiple documents matching the filter criteria
	 * with optional pagination and sorting.
	 * @param filter (Optional) filter criteria to match documents.
	 * @param perPage (Optional) number of documents per page for pagination.
	 * @param page (Optional) page number for pagination.
	 * @param sort (Optional) sort specification.
	 * @returns A promise that resolves to an array of matching documents.
	 */
	override async findMany(filter?: Filter<User>, options?: FindOptions) {
		const foundUsers = await this.mongoCollection.find(filter ?? {}, options).toArray();
		return foundUsers.map(item => this.sanitizeUser(item));
	}

	/**
	 * Finds a single document matching the filter criteria.
	 * @param filter Filter criteria to match the document.
	 * @returns A promise that resolves to the matching document or null if not found.
	 */
	override async findOne(filter: Filter<User>) {
		const foundUser = await this.mongoCollection.findOne(filter);
		if (!foundUser) return null;
		return this.sanitizeUser(foundUser);
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { email: 1 }, unique: true },
			{ background: true, key: { 'profile.first_name': 1, 'profile.last_name': 1 } },
			{ background: true, key: { session_ids: 1 } },
			{ background: true, key: { role_ids: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'users';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}

	private sanitizeUser(user: WithId<User>) {
		return {
			...user,
			password_hash: null,
			permissions: PermissionCatalog.sanitize(user.permissions),
			session_ids: null,
			verification_token_ids: null,
		};
	}
}

/* * */

export const users = asyncSingletonProxy(UsersClass);
