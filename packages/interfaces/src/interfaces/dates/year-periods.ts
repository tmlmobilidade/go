/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { CreateYearPeriodDto, CreateYearPeriodSchema, UpdateYearPeriodDto, UpdateYearPeriodSchema, type YearPeriod } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class YearPeriodsClass extends MongoCollectionClass<YearPeriod, CreateYearPeriodDto, UpdateYearPeriodDto> {
	private static _instance: YearPeriodsClass;
	protected override createSchema: z.ZodSchema = CreateYearPeriodSchema;
	protected override updateSchema: z.ZodSchema = UpdateYearPeriodSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!YearPeriodsClass._instance) {
			const instance = new YearPeriodsClass();
			await instance.connect();
			YearPeriodsClass._instance = instance;
		}
		return YearPeriodsClass._instance;
	}

	/**
	 * Finds YearPeriod documents by agency ID.
	 *
	 * @param id - The agency ID to search for
	 * @returns A promise that resolves to an array of matching documents
	 */
	async findByAgencyId(id: string) {
		return this.mongoCollection.find({ agency_id: id } as Filter<YearPeriod>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'year_periods';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const yearPeriods = asyncSingletonProxy(YearPeriodsClass);
