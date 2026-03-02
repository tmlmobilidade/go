/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreatePeriodDto, type Period, PeriodSchema, type UpdatePeriodDto, UpdatePeriodSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class PeriodsClass extends MongoCollectionClass<Period, CreatePeriodDto, UpdatePeriodDto> {
	private static _instance: PeriodsClass;
	protected override createSchema: z.ZodSchema = PeriodSchema;
	protected override updateSchema: z.ZodSchema = UpdatePeriodSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!PeriodsClass._instance) {
			const instance = new PeriodsClass();
			await instance.connect();
			PeriodsClass._instance = instance;
		}
		return PeriodsClass._instance;
	}

	/**
	 * Finds Period documents by agency ID.
	 *
	 * @param id - The agency ID to search for
	 * @returns A promise that resolves to an array of matching documents
	 */
	async findByAgencyId(id: string) {
		return this.mongoCollection.find({ agency_id: id } as Filter<Period>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'periods';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const periods = asyncSingletonProxy(PeriodsClass);
