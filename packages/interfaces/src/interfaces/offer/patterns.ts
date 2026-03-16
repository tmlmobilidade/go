/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreatePatternDto, CreatePatternSchema, type Pattern, type UpdatePatternDto, UpdatePatternSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class PatternsClass extends MongoCollectionClass<Pattern, CreatePatternDto, UpdatePatternDto> {
	private static _instance: PatternsClass;
	protected override createSchema: z.ZodSchema = CreatePatternSchema;
	protected override updateSchema: z.ZodSchema = UpdatePatternSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!PatternsClass._instance) {
			const instance = new PatternsClass();
			await instance.connect();
			PatternsClass._instance = instance;
		}
		return PatternsClass._instance;
	}

	/**
	 * Finds Pattern documents by line ID.
	 *
	 * @param lineId - The line ID to search for
	 * @returns A promise that resolves to an array of matching documents
	 */
	async findByLineId(lineId: string) {
		return this.mongoCollection.find({ line_id: lineId } as Filter<Pattern>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'patterns';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const patterns = asyncSingletonProxy(PatternsClass);
