/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateZoneDto, CreateZoneSchema, type UpdateZoneDto, UpdateZoneSchema, type Zone } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class ZonesClass extends MongoCollectionClass<Zone, CreateZoneDto, UpdateZoneDto> {
	private static _instance: ZonesClass;
	protected override createSchema: z.ZodSchema = CreateZoneSchema;
	protected override updateSchema: z.ZodSchema = UpdateZoneSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!ZonesClass._instance) {
			const instance = new ZonesClass();
			await instance.connect();
			ZonesClass._instance = instance;
		}
		return ZonesClass._instance;
	}

	/**
	 * Finds a zone document by its code.
	 * @param code The code of the zone to find
	 * @returns A promise that resolves to the matching zone document or null if not found
	 */
	async findByCode(code: string) {
		return this.mongoCollection.findOne({ code } as Filter<Zone>);
	}

	/**
	 * Finds a zone document by its name.
	 * @param name The name of the zone to find
	 * @returns A promise that resolves to the matching zone document or null if not found
	 */
	async findByName(name: string) {
		return this.mongoCollection.findOne({ name } as Filter<Zone>);
	}

	/**
	 * Updates a zone document by its code.
	 * @param code The code of the zone to update.
	 * @param updateFields The fields to update in the zone document.
	 * @returns A promise that resolves to the result of the update operation.
	 */
	async updateByCode(code: string, updateFields: Partial<Zone>) {
		return this.mongoCollection.updateOne({ code } as Filter<Zone>, { $set: updateFields });
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { code: 1 }, unique: true },
		];
	}

	protected getCollectionName(): string {
		return 'zones';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const zones = asyncSingletonProxy(ZonesClass);
