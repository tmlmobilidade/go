/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type Locality } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type IndexDescription } from 'mongodb';

/* * */

class LocalitiesClass extends MongoCollectionClass<Locality, Locality, Locality> {
	private static _instance: LocalitiesClass;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!LocalitiesClass._instance) {
			const instance = new LocalitiesClass();
			await instance.connect();
			LocalitiesClass._instance = instance;
		}
		return LocalitiesClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'localities';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const localities = asyncSingletonProxy(LocalitiesClass);
