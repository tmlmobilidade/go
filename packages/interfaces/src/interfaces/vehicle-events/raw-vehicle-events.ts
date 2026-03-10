/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class RawVehicleEventsClass extends MongoCollectionClass<any, any, any> {
	private static _instance: RawVehicleEventsClass;
	protected override createSchema: z.ZodSchema = z.any();
	protected override updateSchema: z.ZodSchema = z.any();

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

/**
 * @deprecated This should not be used anymore. Only inside the `tracker` module
 * and then you should use the services provided by the local package.
 */
export const rawVehicleEvents = asyncSingletonProxy(RawVehicleEventsClass);
