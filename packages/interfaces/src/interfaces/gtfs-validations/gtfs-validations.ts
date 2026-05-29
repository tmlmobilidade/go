/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { gtfsValidationStopsPipeline } from '@/interfaces/gtfs-validations/pipelines.js';
import { type CreateGtfsValidationDto, CreateGtfsValidationSchema, type GtfsValidation, type UpdateGtfsValidationDto, UpdateGtfsValidationSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class GtfValidationsClass extends MongoCollectionClass<GtfsValidation, CreateGtfsValidationDto, UpdateGtfsValidationDto> {
	private static _instance: GtfValidationsClass;
	protected override createSchema: z.ZodSchema = CreateGtfsValidationSchema;
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
	 * Finds GTFS Validation documents by agency ID.
	 * @param agencyId The agency ID to search for.
	 * @returns A promise that resolves to an array of matching documents
	 */
	async findByAgencyId(agencyId: string) {
		return this.mongoCollection.find({ agency_id: agencyId }).toArray();
	}

	/**
	 * Finds Stops that should be pre-requested for a GTFS Validation agency.
	 * Includes agency-scoped stops and shared stops without flags.
	 * @param agencyId The agency ID to search stops for.
	 * @returns A promise that resolves to an array of matching stops.
	 */
	async findStopsForValidation(agencyId: string) {
		return await this.mongoConnector.client
			.db('production')
			.collection('stops')
			.aggregate(gtfsValidationStopsPipeline(agencyId))
			.toArray();
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

export const gtfsValidations = asyncSingletonProxy(GtfValidationsClass);
