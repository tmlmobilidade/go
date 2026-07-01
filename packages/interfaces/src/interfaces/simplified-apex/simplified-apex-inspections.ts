/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type SimplifiedApexInspection } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';

/* * */

class SimplifiedApexInspectionsClass extends MongoCollectionClass<SimplifiedApexInspection, SimplifiedApexInspection, SimplifiedApexInspection> {
	private static _instance: SimplifiedApexInspectionsClass;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!SimplifiedApexInspectionsClass._instance) {
			const instance = new SimplifiedApexInspectionsClass();
			await instance.connect();
			SimplifiedApexInspectionsClass._instance = instance;
		}
		return SimplifiedApexInspectionsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { created_at: 1 } },
			{ background: true, key: { received_at: 1 } },
			{ background: true, key: { agency_id: 1 } },
			// eslint-disable-next-line perfectionist/sort-objects
			{ background: true, key: { trip_id: 1, created_at: 1 } },
			{ background: true, key: { agency_id: 1, created_at: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'simplified_apex_inspections';
	}

	protected getEnvName(): string {
		return 'TML_INTERFACE_SIMPLIFIED_APEX_INSPECTIONS';
	}
}

/* * */

export const simplifiedApexInspections = asyncSingletonProxy(SimplifiedApexInspectionsClass);
