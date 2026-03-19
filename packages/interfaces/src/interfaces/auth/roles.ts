/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateRoleDto, CreateRoleSchema, PermissionCatalog, type Role, type UpdateRoleDto, UpdateRoleSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, type FindOptions, type IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class RolesClass extends MongoCollectionClass<Role, CreateRoleDto, UpdateRoleDto> {
	private static _instance: RolesClass;
	protected override createSchema: z.ZodSchema = CreateRoleSchema;
	protected override updateSchema: z.ZodSchema = UpdateRoleSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!RolesClass._instance) {
			const instance = new RolesClass();
			await instance.connect();
			RolesClass._instance = instance;
		}
		return RolesClass._instance;
	}

	/**
	 * Finds a user document by its ID.
	 * @param id The ID of the user document to find
	 * @param includePasswordHash Whether to include the password hash in the result
	 * @returns A promise that resolves to the matching user document or null if not found
	 */
	override async findById(id: string, options?: FindOptions) {
		const foundRole = await this.mongoCollection.findOne({ _id: id }, options);
		if (!foundRole) return null;
		return { ...foundRole, permissions: PermissionCatalog.sanitize(foundRole.permissions) };
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
	override async findMany(filter?: Filter<Role>, options?: FindOptions) {
		const foundRoles = await this.mongoCollection.find(filter ?? {}, options).toArray();
		return foundRoles.map(item => ({ ...item, permissions: PermissionCatalog.sanitize(item.permissions) }));
	}

	/**
		 * Finds a single document matching the filter criteria.
		 * @param filter Filter criteria to match the document.
		 * @returns A promise that resolves to the matching document or null if not found.
		 */
	override async findOne(filter: Filter<Role>) {
		const foundRole = await this.mongoCollection.findOne(filter);
		if (!foundRole) return null;
		return { ...foundRole, permissions: PermissionCatalog.sanitize(foundRole.permissions) };
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { name: 1 }, unique: true },
		];
	}

	protected getCollectionName(): string {
		return 'roles';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

export const roles = asyncSingletonProxy(RolesClass);
