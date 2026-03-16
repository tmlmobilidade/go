/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type IndexDescription } from 'mongodb';

/* * */

class SimplifiedVehicleEventsClass extends MongoCollectionClass<SimplifiedVehicleEvent, SimplifiedVehicleEvent, SimplifiedVehicleEvent> {
	private static _instance: SimplifiedVehicleEventsClass;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!SimplifiedVehicleEventsClass._instance) {
			const instance = new SimplifiedVehicleEventsClass();
			await instance.connect();
			SimplifiedVehicleEventsClass._instance = instance;
		}
		return SimplifiedVehicleEventsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { received_at: 1 } },
			// eslint-disable-next-line perfectionist/sort-objects
			{ background: true, key: { trip_id: 1, created_at: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'simplified_vehicle_events';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const simplifiedVehicleEvents = asyncSingletonProxy(SimplifiedVehicleEventsClass);
