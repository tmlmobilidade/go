/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateStopDto, type Stop, StopSchema, type UpdateStopDto, UpdateStopSchema } from '@tmlmobilidade/types';
import { AsyncSingletonProxy } from '@tmlmobilidade/utils';
import { type DeleteResult, type Filter, type IndexDescription, type Sort } from 'mongodb';
import { z } from 'zod';

/* * */

class StopsClass extends MongoCollectionClass<Stop, CreateStopDto, UpdateStopDto> {
	private static _instance: StopsClass;
	protected override createSchema: z.ZodSchema = StopSchema;
	protected override updateSchema: z.ZodSchema = UpdateStopSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!StopsClass._instance) {
			const instance = new StopsClass();
			await instance.connect();
			StopsClass._instance = instance;
		}
		return StopsClass._instance;
	}

	/**
	 * Override deleteById to prevent actual deletion of stop documents.
	 * Stops cannot be deleted, only archived.
	 * @param filter The filter used to select the document to "delete".
	 * @returns A promise that rejects with an error indicating deletion is not allowed.
	 */
	override async deleteById(): Promise<DeleteResult> {
		throw new Error('Method not implemented. Stops cannot be deleted, only archived.');
	}

	/**
	 * Override deleteOne to prevent actual deletion of stop documents.
	 * Stops cannot be deleted, only archived.
	 * @param filter The filter used to select the document to "delete".
	 * @returns A promise that rejects with an error indicating deletion is not allowed.
	 */
	override async deleteOne(): Promise<DeleteResult> {
		throw new Error('Method not implemented. Stops cannot be deleted, only archived.');
	}

	/**
	 * Finds stop documents by municipality ID with optional pagination and sorting.
	 * @param id The municipality ID to search for
	 * @param perPage Optional number of documents per page for pagination
	 * @param page Optional page number for pagination
	 * @param sort Optional sort specification
	 * @returns A promise that resolves to an array of matching stop documents
	 */
	async findByMunicipalityId(id: string, perPage?: number, page?: number, sort?: Sort) {
		const query = this.mongoCollection.find({ municipality_id: id } as Filter<Stop>);
		if (perPage) query.limit(perPage);
		if (page && perPage) query.skip(perPage * (page - 1));
		if (sort) query.sort(sort);
		return query.toArray();
	}

	/**
	 * Finds multiple stop documents by their IDs.
	 * @param ids Array of stop IDs to search for
	 * @returns A promise that resolves to an array of matching stop documents
	 */
	async findManyByIds(ids: string[]) {
		return this.mongoCollection.find({ _id: { $in: ids } } as Filter<Stop>).toArray();
	}

	/**
	 * Toogle the lock status of a document by its ID.
	 * Stop documents are never truly deleted to preserve
	 * data integrity and prevent ID reuse.
	 * @param id The ID of the stop document to archive.
	 * @param forceValue Optional boolean to explicitly set the archived status.
	 * @returns A promise that resolves to the result of the archive operation.
	 */
	async toggleArchiveById(id: string, forceValue?: boolean): Promise<void> {
		const foundDoc = await this.findById(id);
		if (!foundDoc) throw new Error('Stop not found');
		await this.updateById(id, { is_archived: forceValue !== undefined ? forceValue : !foundDoc.is_archived });
	}

	/**
	 * Toogle the lock status of a document by its ID.
	 * @param id The ID of the document to toggle lock status.
	 * @param forceValue Optional boolean to explicitly set the lock status.
	 * @returns A promise that resolves to the result of the update operation.
	 */
	public async toggleLockById(id: string, forceValue?: boolean): Promise<void> {
		const foundDoc = await this.findById(id);
		if (!foundDoc) throw new Error('Stop not found');
		await this.updateById(id, { is_locked: forceValue !== undefined ? forceValue : !foundDoc.is_locked });
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { name: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'stops';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const stops = AsyncSingletonProxy(StopsClass);
