/* * */

import { type Document, type Filter } from '@tmlmobilidade/go-clients-mongo';
import { Dates } from '@tmlmobilidade/go-utils-dates';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';
import { type MinimalOptions } from '../types/minimal-options.type.js';

/**
 * Toggles the lock status of a document by its ID.
 * @param context The context of the Mongo interface.
 * @param _id The ID of the document to toggle the lock status of.
 * @returns A promise that resolves to the result of the toggle operation.
 */
export async function toggleLockById<T extends Document>(context: GoDbCollectionContext<T>, _id: string, options?: MinimalOptions): Promise<T> {
	//

	if (!context.schema) {
		throw new Error(`No schema defined for toggle lock operation on ${context.collectionName} collection. Use .toggleLockByIdUnsafe() to toggle documents without schema validation.`);
	}

	//
	// Retrieve the existing document from the collection

	const existingDocument = await context.collection.findOne<T>({ _id: { $eq: _id as Filter<T>['_id'] } }, { session: options?.session });

	if (!existingDocument) {
		throw new Error(`Document not found in ${context.collectionName} collection.`);
	}

	//
	// Set the value of updated_at to the current timestamp.

	const updatableDocument = {
		...existingDocument,
		is_locked: !existingDocument.is_locked,
		updated_at: Dates.now('utc').unix_milliseconds,
	};

	//
	// Validate the document against the schema

	const validatedDocument = context.schema.parse(updatableDocument);

	//
	// Attempt to update the document in the collection
	// and check if the update operation was acknowledged

	const updateResult = await context.collection.updateOne({ _id: { $eq: _id as Filter<T>['_id'] } }, validatedDocument, { session: options?.session });

	if (!updateResult.acknowledged) {
		throw new Error(`Failed to update document into ${context.collectionName} collection. The update operation was not acknowledged.`);
	}

	//
	// Fetch the updated document and return it

	const updatedDoc = await context.collection.findOne<T>({ _id: { $eq: _id as Filter<T>['_id'] } }, { session: options?.session });

	if (!updatedDoc) {
		throw new Error(`Failed to find updated document in ${context.collectionName} collection. The updated document was not found.`);
	}

	return updatedDoc;
}
