/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type District } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type IndexDescription } from 'mongodb';

/* * */

class DistrictsClass extends MongoCollectionClass<District, District, District> {
	private static _instance: DistrictsClass;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!DistrictsClass._instance) {
			const instance = new DistrictsClass();
			await instance.connect();
			DistrictsClass._instance = instance;
		}
		return DistrictsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'districts';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const districts = asyncSingletonProxy(DistrictsClass);
