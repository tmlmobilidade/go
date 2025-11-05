/* * */

import { MongoCollectionClass } from '@/mongo-collection.js';
import { type Agency, AgencySchema, type CreateAgencyDto, type UpdateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/types';
import { AsyncSingletonProxy } from '@tmlmobilidade/utils';
import { Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class AgenciesClass extends MongoCollectionClass<Agency, CreateAgencyDto, UpdateAgencyDto> {
	private static _instance: AgenciesClass;
	protected override createSchema: z.ZodSchema = AgencySchema;
	protected override updateSchema: z.ZodSchema = UpdateAgencySchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!AgenciesClass._instance) {
			const instance = new AgenciesClass();
			await instance.connect();
			AgenciesClass._instance = instance;
		}
		return AgenciesClass._instance;
	}

	async findByCode(code: string) {
		return this.mongoCollection.findOne({ code } as Filter<Agency>);
	}

	async updateByCode(code: string, fields: Partial<Agency>) {
		return this.mongoCollection.updateOne({ code } as Filter<Agency>, { $set: fields });
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { name: 1 }, unique: true },
			{ background: true, key: { code: 1 }, unique: true },
			{ background: true, key: { email: 1 }, unique: true },
		];
	}

	protected getCollectionName(): string {
		return 'agencies';
	}

	protected getCreateSchema(): z.ZodSchema {
		return AgencySchema;
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}

	protected getUpdateSchema(): z.ZodSchema {
		return UpdateAgencySchema;
	}
}

/* * */

export const agencies = AsyncSingletonProxy(AgenciesClass);
