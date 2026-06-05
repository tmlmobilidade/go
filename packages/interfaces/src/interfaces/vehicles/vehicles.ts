/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateVehicleDto, CreateVehicleSchema, type UpdateVehicleDto, UpdateVehicleSchema, type Vehicle } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class VehiclesClass extends MongoCollectionClass<Vehicle, CreateVehicleDto, UpdateVehicleDto> {
	private static _instance: VehiclesClass;

	protected override createSchema: z.ZodSchema = CreateVehicleSchema;
	protected override updateSchema: z.ZodSchema = UpdateVehicleSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!VehiclesClass._instance) {
			const instance = new VehiclesClass();
			await instance.connect();
			VehiclesClass._instance = instance;
		}
		return VehiclesClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { name: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'vehicles';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const vehicles = asyncSingletonProxy(VehiclesClass);
