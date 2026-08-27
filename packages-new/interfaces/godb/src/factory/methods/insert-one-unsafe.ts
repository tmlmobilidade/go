/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type Document, type Filter, type OptionalUnlessRequiredId } from '@tmlmobilidade/go-clients-mongo';
import { generateRandomString } from '@tmlmobilidade/strings';

import { type GoDbCollectionContext } from '../types/godb-collection-context.type.js';
import { type MinimalOptions } from '../types/minimal-options.type.js';

/**
 * Inserts a single document into the collection.
 * @param doc The document to insert.
 * @param options The options for the insert operation.
 * @returns A promise that resolves to the result of the insert operation.
 */
export async function insertOneUnsafe<T extends Document>(context: GoDbCollectionContext<T>, doc: T, options?: MinimalOptions): Promise<T> {
	// Setup a copy of the document to be inserted with defaults
	let parsedDocument = {
		...doc,
		// created_at: doc.created_at || Dates.now('utc').unix_timestamp,
		// created_by: doc.created_by || 'system',
		// updated_at: doc.updated_at || Dates.now('utc').unix_timestamp,
		// updated_by: doc.updated_by || 'system',
	} as OptionalUnlessRequiredId<T>;

	// Validate the document against the create schema if unsafe is false
	try {
		if (!context.schema) throw new Error('No schema defined for insert operation. This is either an internal interface error or you should pass unsafe=true to the insert operation.');
		parsedDocument = context.schema.parse(parsedDocument);
	} catch (error) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, error.message, { cause: error });
	}

	// Preserve a caller-provided _id (create schemas omit it, so parse strips it),
	// otherwise generate a unique one.
	if (doc._id) {
		parsedDocument._id = doc._id;
	} else {
		parsedDocument._id = generateRandomString({ length: 5 }) as T['_id'];
		while (await context.collection.findOne({ _id: { $eq: parsedDocument._id as Filter<T>['_id'] } })) {
			parsedDocument._id = generateRandomString({ length: 5 }) as T['_id'];
		}
	}

	// Attempt to insert the document into the collection
	const result = await context.collection.insertOne(parsedDocument, { session: options?.session });
	// Check if the insert operation was acknowledged
	if (!result.acknowledged) throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to insert document', result);
	// Otherwise, fetch and return the inserted document
	const insertedDoc = await context.collection.findOne({ _id: { $eq: result.insertedId as Filter<T>['_id'] } }, options);
	if (!insertedDoc) throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to find inserted document', result);
	return insertedDoc as unknown as T;
}
