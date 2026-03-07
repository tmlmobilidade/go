/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateRouteDto, CreateRouteSchema, type Route, type UpdateRouteDto, UpdateRouteSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class RoutesClass extends MongoCollectionClass<Route, CreateRouteDto, UpdateRouteDto> {
	private static _instance: RoutesClass;
	protected override createSchema: z.ZodSchema = CreateRouteSchema;
	protected override updateSchema: z.ZodSchema = UpdateRouteSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!RoutesClass._instance) {
			const instance = new RoutesClass();
			await instance.connect();
			RoutesClass._instance = instance;
		}
		return RoutesClass._instance;
	}

	/**
	 * Finds Route documents by line ID.
	 *
	 * @param lineId - The line ID to search for
	 * @returns A promise that resolves to an array of matching documents
	 */
	async findByLineId(lineId: string) {
		return this.mongoCollection.find({ line_id: lineId } as Filter<Route>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'routes';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const routes = asyncSingletonProxy(RoutesClass);
