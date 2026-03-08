/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type RawVehicleEvent } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type IndexDescription } from 'mongodb';

/* * */

class RawVehicleEventsClass extends MongoCollectionClass<RawVehicleEvent, RawVehicleEvent, RawVehicleEvent> {
	private static _instance: RawVehicleEventsClass;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!RawVehicleEventsClass._instance) {
			const instance = new RawVehicleEventsClass();
			await instance.connect();
			RawVehicleEventsClass._instance = instance;
		}
		return RawVehicleEventsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { received_at: 1 } },
			// eslint-disable-next-line perfectionist/sort-objects
			{ background: true, key: { trip_id: 1, created_at: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'raw_vehicle_events';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const rawVehicleEvents = asyncSingletonProxy(RawVehicleEventsClass);
