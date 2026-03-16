/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateFareDto, CreateFareSchema, type Fare, type UpdateFareDto, UpdateFareSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class FaresClass extends MongoCollectionClass<Fare, CreateFareDto, UpdateFareDto> {
	private static _instance: FaresClass;
	protected override createSchema: z.ZodSchema = CreateFareSchema;
	protected override updateSchema: z.ZodSchema = UpdateFareSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!FaresClass._instance) {
			const instance = new FaresClass();
			await instance.connect();
			FaresClass._instance = instance;
		}
		return FaresClass._instance;
	}

	/**
	 * Finds Fare documents by agency IDs.
	 *
	 * @param ids - The agency IDs to search for
	//  * @returns A promise that resolves to an array of matching documents
	 */
	async findByAgencyIds(ids: string[]) {
		return this.mongoCollection.find({ agency_ids: { $in: ids } } as Filter<Fare>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'fares';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const fares = asyncSingletonProxy(FaresClass);
