/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { DocumentSchema, type HashedPattern } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class HashedPatternsClass extends MongoCollectionClass<HashedPattern, HashedPattern, HashedPattern> {
	private static _instance: HashedPatternsClass;

	protected override createSchema: z.ZodSchema = DocumentSchema;
	protected override updateSchema: z.ZodSchema = DocumentSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!HashedPatternsClass._instance) {
			const instance = new HashedPatternsClass();
			await instance.connect();
			HashedPatternsClass._instance = instance;
		}
		return HashedPatternsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { agency_id: 1 } },
			{ background: true, key: { line_id: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'hashed_patterns';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const hashedPatterns = asyncSingletonProxy(HashedPatternsClass);
