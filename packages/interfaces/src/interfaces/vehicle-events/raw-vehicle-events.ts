/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type RawVehicleEvent, RawVehicleEventSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class RawVehicleEventsClass extends MongoCollectionClass<RawVehicleEvent, RawVehicleEvent, RawVehicleEvent> {
	private static _instance: RawVehicleEventsClass;
	protected override createSchema: z.ZodSchema = RawVehicleEventSchema;
	protected override updateSchema: z.ZodSchema = RawVehicleEventSchema;

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
		return [];
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
