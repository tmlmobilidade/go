/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type Municipality } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type IndexDescription } from 'mongodb';

/* * */

class MunicipalitiesClass extends MongoCollectionClass<Municipality, Municipality, Municipality> {
	private static _instance: MunicipalitiesClass;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!MunicipalitiesClass._instance) {
			const instance = new MunicipalitiesClass();
			await instance.connect();
			MunicipalitiesClass._instance = instance;
		}
		return MunicipalitiesClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'municipalities';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const municipalities = asyncSingletonProxy(MunicipalitiesClass);
