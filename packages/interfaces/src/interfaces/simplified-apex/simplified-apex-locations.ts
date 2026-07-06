/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type SimplifiedApexLocation } from '@tmlmobilidade/go-types-apex';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';

/* * */

class SimplifiedApexLocationsClass extends MongoCollectionClass<SimplifiedApexLocation, SimplifiedApexLocation, SimplifiedApexLocation> {
	private static _instance: SimplifiedApexLocationsClass;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!SimplifiedApexLocationsClass._instance) {
			const instance = new SimplifiedApexLocationsClass();
			await instance.connect();
			SimplifiedApexLocationsClass._instance = instance;
		}
		return SimplifiedApexLocationsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { created_at: 1 } },
			{ background: true, key: { received_at: 1 } },
			{ background: true, key: { agency_id: 1 } },
			// eslint-disable-next-line perfectionist/sort-objects
			{ background: true, key: { trip_id: 1, created_at: 1 } },
			{ background: true, key: { agency_id: 1, created_at: 1 } },
			{ background: true, key: { agency_id: 1, device_id: 1, mac_sam_serial_number: 1 } },
			// eslint-disable-next-line perfectionist/sort-objects
			{ background: true, key: { mac_sam_serial_number: 1, created_at: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'simplified_apex_locations';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const simplifiedApexLocations = asyncSingletonProxy(SimplifiedApexLocationsClass);
