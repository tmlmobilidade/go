/* * */

import { type Collection, type Db, type Document, type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { z } from 'zod';

export interface GoDbCollectionContext<T extends Document> {
	collection: Collection<T>
	collectionName: string
	database: Db
	indexDescription: null | SimplifiedMongoIndex<T>[]
	protectedUpdateFields?: (keyof T)[]
	schema: null | z.ZodSchema
};
