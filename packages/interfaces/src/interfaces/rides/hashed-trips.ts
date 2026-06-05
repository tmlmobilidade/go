/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { DocumentSchema, type HashedTrip } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class HashedTripsClass extends MongoCollectionClass<HashedTrip, HashedTrip, HashedTrip> {
	private static _instance: HashedTripsClass;

	protected override createSchema: z.ZodSchema = DocumentSchema;
	protected override updateSchema: z.ZodSchema = DocumentSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!HashedTripsClass._instance) {
			const instance = new HashedTripsClass();
			await instance.connect();
			HashedTripsClass._instance = instance;
		}
		return HashedTripsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { agency_id: 1 } },
			{ background: true, key: { line_id: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'hashed_trips';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const hashedTrips = asyncSingletonProxy(HashedTripsClass);
