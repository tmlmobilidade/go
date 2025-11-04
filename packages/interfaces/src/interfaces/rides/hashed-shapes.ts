/* * */

import { MongoCollectionClass } from '@/mongo-collection.js';
import { DocumentSchema, HashedShape } from '@tmlmobilidade/go-types';
import { AsyncSingletonProxy } from '@tmlmobilidade/go-utils';
import { IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class HashedShapesClass extends MongoCollectionClass<HashedShape, HashedShape, HashedShape> {
	private static _instance: HashedShapesClass;
	protected override createSchema: z.ZodSchema = DocumentSchema;
	protected override updateSchema: z.ZodSchema = DocumentSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!HashedShapesClass._instance) {
			const instance = new HashedShapesClass();
			await instance.connect();
			HashedShapesClass._instance = instance;
		}
		return HashedShapesClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { agency_id: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'hashed_shapes';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const hashedShapes = AsyncSingletonProxy(HashedShapesClass);
