/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type Agency, type CreateAgencyDto, CreateAgencySchema, type UpdateAgencyDto, UpdateAgencySchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class AgenciesClass extends MongoCollectionClass<Agency, CreateAgencyDto, UpdateAgencyDto> {
	private static _instance: AgenciesClass;
	protected override createSchema: z.ZodSchema = CreateAgencySchema;
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

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const agencies = asyncSingletonProxy(AgenciesClass);
