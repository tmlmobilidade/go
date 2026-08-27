/* * */

import { type InsertOneOptions, WithId } from '@tmlmobilidade/go-clients-mongo';
import { type GoMongoDocument } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { generateRandomString } from '@tmlmobilidade/strings';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';

/* * */

type InsertableDocument<T extends GoMongoDocument> = Omit<T, '_id' | 'created_at' | 'updated_at'>;

/**
 * Inserts a single document into the collection.
 * @param doc The document to insert.
 * @param options The options for the insert operation.
 * @returns A promise that resolves to the result of the insert operation.
 */
export async function insertOne<T extends GoMongoDocument>(context: GoDbCollectionContext<T>, doc: InsertableDocument<T>, options?: InsertOneOptions): Promise<T> {
	//

	if (!context.schema) {
		throw new Error(`No schema defined for insert operation on ${context.collectionName} collection. Use .insertOneUnsafe() to insert documents without schema validation.`);
	}

	//
	// Add default values to the document, including a random _id,
	// and check if the generated _id is already in use.
	// Generate a new _id if it is already in use.

	const insertableDocument = {
		...doc,
		_id: generateRandomString({ length: 5 }),
		created_at: Dates.now('utc').unix_timestamp,
		updated_at: Dates.now('utc').unix_timestamp,
	};

	while (await context.collection.findOne({ _id: insertableDocument._id as WithId<T>['_id'] })) {
		insertableDocument._id = generateRandomString({ length: 5 }) as T['_id'];
	}

	//
	// Validate the document against the schema

	const validatedDocument = context.schema.parse(insertableDocument);

	//
	// Attempt to insert the document into the collection
	// and check if the insert operation was acknowledged

	const insertResult = await context.collection.insertOne(validatedDocument, options);

	if (!insertResult.acknowledged) {
		throw new Error(`Failed to insert document into ${context.collectionName} collection. The insert operation was not acknowledged.`);
	}

	//
	// Fetch the inserted document and return it

	const insertedDoc = await context.collection.findOne({ _id: insertResult.insertedId as WithId<T>['_id'] }, options);

	if (!insertedDoc) {
		throw new Error(`Failed to find inserted document in ${context.collectionName} collection. The inserted document was not found.`);
	}

	return insertedDoc;
}
