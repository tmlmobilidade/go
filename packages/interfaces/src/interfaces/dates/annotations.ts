/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type Annotation, type CreateAnnotationDto, CreateAnnotationSchema, type UpdateAnnotationDto, UpdateAnnotationSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type Filter, IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class AnnotationsClass extends MongoCollectionClass<Annotation, CreateAnnotationDto, UpdateAnnotationDto> {
	private static _instance: AnnotationsClass;
	protected override createSchema: z.ZodSchema = CreateAnnotationSchema;
	protected override updateSchema: z.ZodSchema = UpdateAnnotationSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!AnnotationsClass._instance) {
			const instance = new AnnotationsClass();
			await instance.connect();
			AnnotationsClass._instance = instance;
		}
		return AnnotationsClass._instance;
	}

	/**
	 * Finds Annotation documents by agency IDs.
	 *
	 * @param ids - The agency IDs to search for
	 * @returns A promise that resolves to an array of matching documents
	 */
	async findByAgencyIds(ids: string[]) {
		return this.mongoCollection.find({ agency_ids: { $in: ids } } as Filter<Annotation>).toArray();
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [];
	}

	protected getCollectionName(): string {
		return 'annotations';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const annotations = asyncSingletonProxy(AnnotationsClass);
