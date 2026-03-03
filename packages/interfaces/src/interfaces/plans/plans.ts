/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreatePlanDto, CreatePlanSchema, type Plan, type UpdatePlanDto, UpdatePlanSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class PlansClass extends MongoCollectionClass<Plan, CreatePlanDto, UpdatePlanDto> {
	private static _instance: PlansClass;
	protected override createSchema: z.ZodSchema = CreatePlanSchema;
	protected override updateSchema: z.ZodSchema = UpdatePlanSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!PlansClass._instance) {
			const instance = new PlansClass();
			await instance.connect();
			PlansClass._instance = instance;
		}
		return PlansClass._instance;
	}

	/**
	 * Finds Plan documents by agency ID.
	 *
	 * @param id - The agency ID to search for
	 * @returns A promise that resolves to an array of matching documents
	 */
	async findByAgencyId(id: string) {
		return this.mongoCollection.find({ agency_id: id } as Filter<Plan>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'plans';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const plans = asyncSingletonProxy(PlansClass);
