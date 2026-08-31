/* * */

import { type Document, OptionalUnlessRequiredId } from '@tmlmobilidade/go-clients-mongo';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { generateRandomString } from '@tmlmobilidade/strings';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';
import { type InsertableDocument } from '../types/insertable-document.type.js';
import { type MinimalOptions } from '../types/minimal-options.type.js';

/**
 * Inserts multiple documents into the collection.
 * @param docs The documents to insert.
 * @param options The options for the insert operation.
 * @returns A promise that resolves to the inserted documents.
 */
export async function insertMany<T extends Document>(context: GoDbCollectionContext<T>, docs: InsertableDocument<T>[], options?: MinimalOptions): Promise<T[]> {
	//

	if (!context.schema) {
		throw new Error(`No schema defined for insertMany operation on ${context.collectionName} collection. Use .insertManyUnsafe() to insert documents without schema validation.`);
	}

	//
	// Get the current IDs used in the collection

	const distinctIdsResult = await context.collection.distinct('_id');

	const currentlyUsedIds = new Set<string>(distinctIdsResult);

	//
	// Add default values to the document, including a random _id,
	// and check if the generated _id is already in use.
	// Generate a new _id if it is already in use.

	const insertableDocuments = docs.map((doc) => {
		// Generate a new random ID that is not already in use
		let unusedId = generateRandomString({ length: 5 });
		// Check if the generated ID is already in use
		while (currentlyUsedIds.has(unusedId)) {
			unusedId = generateRandomString({ length: 5 });
		}
		// Save the new ID to the set of used IDs
		currentlyUsedIds.add(unusedId);
		// Add default values to the document
		return { ...doc,
			_id: unusedId,
			created_at: Dates.now('utc').unix_milliseconds,
			updated_at: Dates.now('utc').unix_milliseconds };
	});

	//
	// Validate the document against the schema

	const validatedDocuments = context.schema.array().parse(insertableDocuments) as OptionalUnlessRequiredId<T>[];

	//
	// Attempt to insert the document into the collection
	// and check if the insert operation was acknowledged

	const insertResult = await context.collection.insertMany(validatedDocuments, { session: options?.session });

	if (!insertResult.acknowledged) {
		throw new Error(`Failed to insert documents into ${context.collectionName} collection. The insert operation was not acknowledged.`);
	}

	//
	// Fetch the inserted document and return it

	const insertedDocs = await context.collection.find<T>({ _id: { $in: Object.values(insertResult.insertedIds) as T['_id'][] } }, { session: options?.session }).toArray();

	if (!insertedDocs) {
		throw new Error(`Failed to find inserted documents in ${context.collectionName} collection. The inserted documents were not found.`);
	}

	return insertedDocs;
}
