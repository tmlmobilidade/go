/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateTypologyDto, CreateTypologySchema, type Typology, type UpdateTypologyDto, UpdateTypologySchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class TypologiesClass extends MongoCollectionClass<Typology, CreateTypologyDto, UpdateTypologyDto> {
	private static _instance: TypologiesClass;
	protected override createSchema: z.ZodSchema = CreateTypologySchema;
	protected override updateSchema: z.ZodSchema = UpdateTypologySchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!TypologiesClass._instance) {
			const instance = new TypologiesClass();
			await instance.connect();
			TypologiesClass._instance = instance;
		}
		return TypologiesClass._instance;
	}

	/**
	 * Finds Typology documents by agency IDs.
	 *
	 * @param ids - The agency IDs to search for
	//  * @returns A promise that resolves to an array of matching documents
	 */
	async findByAgencyIds(ids: string[]) {
		return this.mongoCollection.find({ agency_ids: { $in: ids } } as Filter<Typology>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'typologies';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const typologies = asyncSingletonProxy(TypologiesClass);
