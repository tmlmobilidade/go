/* * */

import { type Db, type Document, type SimplifiedMongoIndex } from '@tmlmobilidade/go-clients-mongo';
import { z } from 'zod';

import { aggregate, aggregateCursor } from './methods/aggregate.js';
import { deleteById } from './methods/delete-by-id.js';
import { deleteOne } from './methods/delete-one.js';
import { findById } from './methods/find-by-id.js';
import { findMany } from './methods/find-many.js';
import { findOne } from './methods/find-one.js';
import { getCollection } from './methods/get-collection.js';
import { insertOneUnsafe } from './methods/insert-one-unsafe.js';
import { insertOne } from './methods/insert-one.js';
import { type GoDbCollectionContext } from './types/godb-collection-context.type.js';
import { type GoDbCollection } from './types/godb-collection.type.js';

/* * */

interface CreateGoDbCollectionParams<T extends Document> {
	collectionName: string
	database: Db
	indexDescription: null | SimplifiedMongoIndex<T>[]
	schema: null | z.ZodSchema
}

/**
 * Creates a GoDB collection interface for a given collection.
 * @param params The parameters for the GoDB collection interface.
 * @returns The GoDB collection interface implementation.
 */
export function createGoDbCollection<T extends Document>({ collectionName, database, indexDescription, schema }: CreateGoDbCollectionParams<T>): GoDbCollection<T> {
	//

	const context: GoDbCollectionContext<T> = {
		collection: database.collection<T>(collectionName),
		collectionName,
		database,
		indexDescription,
		schema,
	};

	return {

		aggregate: (pipeline, options) => aggregate(context, pipeline, options),

		aggregateCursor: (pipeline, options) => aggregateCursor(context, pipeline, options),

		// count: filter => count(context, filter),

		deleteById: (id, options) => deleteById(context, id, options),

		// deleteMany: filter => deleteMany(context, filter),

		deleteOne: (filter, options) => deleteOne(context, filter, options),

		// distinct: (key, filter) => distinct(context, key, filter),

		// exists: (key, value) => exists(context, key, value),

		// existsById: id => existsById(context, id),

		findById: (_id, options) => findById(context, _id, options),

		findMany: (filter, options) => findMany(context, filter, options),

		findOne: (filter, options) => findOne<T>(context, filter, options),

		getCollection: () => getCollection(context),

		// getCollectionName: () => getCollectionName(context),

		// insertMany: (docs, options) => insertMany(context, docs, options),

		insertOne: (doc, options) => insertOne<T>(context, doc, options),

		insertOneUnsafe: (doc, options) => insertOneUnsafe<T>(context, doc, options),

		// isLocked: filter => isLocked(context, filter),

		// isLockedById: id => isLockedById(context, id),

		// toggleLockById: (id, forceValue) => toggleLockById(context, id, forceValue),

		// updateById: (id, updateFields, options) => updateById(context, id, updateFields, options),

		// updateMany: (filter, updateFields, options) => updateMany(context, filter, updateFields, options),

		// updateOne: (filter, updateFields, options) => updateOne(context, filter, updateFields, options),
	};
}
