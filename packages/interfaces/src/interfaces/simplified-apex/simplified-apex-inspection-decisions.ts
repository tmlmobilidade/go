/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type SimplifiedApexInspectionDecision } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';

/* * */

class SimplifiedApexInspectionDecisionsClass extends MongoCollectionClass<SimplifiedApexInspectionDecision, SimplifiedApexInspectionDecision, SimplifiedApexInspectionDecision> {
	private static _instance: SimplifiedApexInspectionDecisionsClass;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!SimplifiedApexInspectionDecisionsClass._instance) {
			const instance = new SimplifiedApexInspectionDecisionsClass();
			await instance.connect();
			SimplifiedApexInspectionDecisionsClass._instance = instance;
		}
		return SimplifiedApexInspectionDecisionsClass._instance;
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
		return 'simplified_apex_inspection_decisions';
	}

	protected getEnvName(): string {
		return 'TML_INTERFACE_SIMPLIFIED_APEX_INSPECTION_DECISIONS';
	}
}

/* * */

export const simplifiedApexInspectionDecisions = asyncSingletonProxy(SimplifiedApexInspectionDecisionsClass);
