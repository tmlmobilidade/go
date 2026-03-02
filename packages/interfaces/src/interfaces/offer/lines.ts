/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateLineDto, CreateLineSchema, type Line, type UpdateLineDto, UpdateLineSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class LinesClass extends MongoCollectionClass<Line, CreateLineDto, UpdateLineDto> {
	private static _instance: LinesClass;
	protected override createSchema: z.ZodSchema = CreateLineSchema;
	protected override updateSchema: z.ZodSchema = UpdateLineSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!LinesClass._instance) {
			const instance = new LinesClass();
			await instance.connect();
			LinesClass._instance = instance;
		}
		return LinesClass._instance;
	}

	/**
	 * Finds Line documents by agency IDs.
	 *
	 * @param ids - The agency IDs to search for
	//  * @returns A promise that resolves to an array of matching documents
	 */
	async findByAgencyIds(ids: string[]) {
		return this.mongoCollection.find({ agency_id: { $in: ids } } as Filter<Line>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'lines';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const lines = asyncSingletonProxy(LinesClass);
