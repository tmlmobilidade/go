/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { CreateOrganizationDto, Organization, OrganizationSchema, UpdateOrganizationDto, UpdateOrganizationSchema } from '@tmlmobilidade/types';
import { AsyncSingletonProxy } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class OrganizationsClass extends MongoCollectionClass<Organization, CreateOrganizationDto, UpdateOrganizationDto> {
	private static _instance: OrganizationsClass;
	protected override createSchema: z.ZodSchema = OrganizationSchema;
	protected override updateSchema: z.ZodSchema = UpdateOrganizationSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!OrganizationsClass._instance) {
			const instance = new OrganizationsClass();
			await instance.connect();
			OrganizationsClass._instance = instance;
		}
		return OrganizationsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { name: 1 }, unique: true },
		];
	}

	protected getCollectionName(): string {
		return 'organizations';
	}

	protected getCreateSchema(): z.ZodSchema {
		return OrganizationSchema;
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

export const organizations = AsyncSingletonProxy(OrganizationsClass);
