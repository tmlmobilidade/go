/* * */

import { MongoCollectionClass } from '@/mongo-collection.js';
import { CreateGtfsValidationDto, GtfsValidation, GtfsValidationSchema, UpdateGtfsValidationDto, UpdateGtfsValidationSchema } from '@tmlmobilidade/types';
import { AsyncSingletonProxy } from '@tmlmobilidade/utils';
import { Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class GtfValidationsClass extends MongoCollectionClass<GtfsValidation, CreateGtfsValidationDto, UpdateGtfsValidationDto> {
	private static _instance: GtfValidationsClass;
	protected override createSchema: z.ZodSchema = GtfsValidationSchema;
	protected override updateSchema: z.ZodSchema = UpdateGtfsValidationSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!GtfValidationsClass._instance) {
			const instance = new GtfValidationsClass();
			await instance.connect();
			GtfValidationsClass._instance = instance;
		}
		return GtfValidationsClass._instance;
	}

	/**
	 * Finds Validation documents by agency ID.
	 *
	 * @param id - The agency ID to search for
	 * @returns A promise that resolves to an array of matching documents
	 */
	async findByAgencyId(id: string) {
		return this.mongoCollection.find({ agency_id: id } as Filter<GtfsValidation>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'gtfs_validations';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const gtfsValidations = AsyncSingletonProxy(GtfValidationsClass);
