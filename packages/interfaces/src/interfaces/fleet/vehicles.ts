/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateVehicleDto, type UpdateVehicleDto, UpdateVehicleSchema, type Vehicle, vehicleSchema } from '@tmlmobilidade/types';
import { AsyncSingletonProxy } from '@tmlmobilidade/utils';
import { type DeleteResult, type Filter, type IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class VehiclesClass extends MongoCollectionClass<Vehicle, CreateVehicleDto, UpdateVehicleDto> {
	private static _instance: VehiclesClass;
	protected override createSchema: z.ZodSchema = vehicleSchema;
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

	/**
	 * Override deleteById to prevent actual deletion of vehicle documents.
	 * Vehicles cannot be deleted, only archived.
	 * @param filter The filter used to select the document to "delete".
	 * @returns A promise that rejects with an error indicating deletion is not allowed.
	 */
	override async deleteById(): Promise<DeleteResult> {
		throw new Error('Method not implemented. Vehicles cannot be deleted, only archived.');
	}

	/**
	 * Override deleteOne to prevent actual deletion of vehicle documents.
	 * Vehicles cannot be deleted, only archived.
	 * @param filter The filter used to select the document to "delete".
	 * @returns A promise that rejects with an error indicating deletion is not allowed.
	 */
	override async deleteOne(): Promise<DeleteResult> {
		throw new Error('Method not implemented. Vehicles cannot be deleted, only archived.');
	}

	/**
	 * Finds multiple vehicle documents by their IDs.
	 * @param ids Array of vehicle IDs to search for
	 * @returns A promise that resolves to an array of matching vehicle documents
	 */
	async findManyByIds(ids: string[]) {
		return this.mongoCollection.find({ _id: { $in: ids } } as Filter<Vehicle>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { name: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'Vehicles';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const Vehicles = AsyncSingletonProxy(VehiclesClass);
