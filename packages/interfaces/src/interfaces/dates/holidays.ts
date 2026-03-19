/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateHolidayDto, CreateHolidaySchema, type Holiday, type UpdateHolidayDto, UpdateHolidaySchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class HolidaysClass extends MongoCollectionClass<Holiday, CreateHolidayDto, UpdateHolidayDto> {
	private static _instance: HolidaysClass;
	protected override createSchema: z.ZodSchema = CreateHolidaySchema;
	protected override updateSchema: z.ZodSchema = UpdateHolidaySchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!HolidaysClass._instance) {
			const instance = new HolidaysClass();
			await instance.connect();
			HolidaysClass._instance = instance;
		}
		return HolidaysClass._instance;
	}

	/**
	 * Finds Holiday documents by agency IDs.
	 *
	 * @param ids - The agency IDs to search for
	 * @returns A promise that resolves to an array of matching documents
	 */
	async findByAgencyIds(ids: string[]) {
		return this.mongoCollection.find({ agency_ids: { $in: ids } } as Filter<Holiday>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'holidays';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const holidays = asyncSingletonProxy(HolidaysClass);
