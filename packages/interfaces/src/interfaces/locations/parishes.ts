/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type Parish } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type IndexDescription } from 'mongodb';

/* * */

class ParishesClass extends MongoCollectionClass<Parish, Parish, Parish> {
	private static _instance: ParishesClass;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!ParishesClass._instance) {
			const instance = new ParishesClass();
			await instance.connect();
			ParishesClass._instance = instance;
		}
		return ParishesClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'parishes';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const parishes = asyncSingletonProxy(ParishesClass);
