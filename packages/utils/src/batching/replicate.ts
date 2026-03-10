/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

interface ReplicateProps<SourceDocType> {

	/**
	 * A function to count the total number of documents
	 * in the destination database. This must return a number.
	 * @returns A promise that resolves to a number.
	 */
	countDestinationDbFn: () => Promise<number>

	/**
	 * A function to count the total number of documents
	 * in the source database. This must return a number.
	 * @returns A promise that resolves to a number.
	 */
	countSourceDbFn: () => Promise<number>

	/**
	 * A function that deletes documents in the destination database,
	 * from an array of unique document IDs. This is used to remove any extra documents
	 * that are present in the destination database but not in the source database.
	 * This function should return a promise that resolves when the deletion is complete.
	 * @param uniqueIds An array of unique document IDs to be deleted from the destination database.
	 * @returns A promise that resolves when the deletion is complete.
	 */
	deleteDestinationDbFn: (uniqueIds: string[]) => Promise<void>

	/**
	 * A function to get the distinct document IDs from the destination database.
	 * This must return an array of strings.
	 * @returns A promise that resolves to an array of strings.
	 */
	distinctDestinationDbFn: () => Promise<string[]>

	/**
	 * A function to get the distinct document IDs from the source database.
	 * This must return an array of strings.
	 * @returns A promise that resolves to an array of strings.
	 */
	distinctSourceDbFn: () => Promise<string[]>

	/**
	 * This is the function that should query the source database for the missing documents based on their IDs.
	 * It should return an async iterable (e.g., an async generator or a MongoDB `.stream()`) that yields
	 * the missing documents one by one.
	 * @param missingDocumentIds An array of document IDs that are missing in the destination database.
	 * @returns An async iterable that yields source documents one by one.
	 */
	missingDocumentsSourceDbAsyncIterator: (missingDocumentIds: string[]) => AsyncIterable<SourceDocType>

	/**
	 * An optional callback function that will be executed after the replication process is complete.
	 * This can be used to perform any necessary cleanup tasks, such as flushing writers or logging.
	 */
	onCompleteCallbackFn?: () => Promise<void>

	/**
	 * This function receives a document from the source database and should write it to the destination database.
	 * You can use any method you prefer to write the document to the destination database, such as a bulk insert or individual writes,
	 * and perform any necessary transformations on the document before writing it.
	 * @param sourceDocument The source document to be written to the destination database.
	 * @returns A promise that resolves when the document has been successfully written to the destination database.
	 */
	writeSourceDocumentFn: (sourceDocument: SourceDocType) => Promise<void>

}

/**
 * Copy documents from a source database to a destination database in multiple steps.
 * The goal of this function is to ensure that the destination database has the same documents
 * as the source database. The replication process is designed to be efficient and to minimize
 * the amount of data transferred between the two databases by only syncing the missing documents.
 *
 * 1. First count the total number of documents in both databases to check if they match. This is a
 * crucial optimization step, as it allows us to skip the replication process if both databases already
 * have the same number of documents, which would indicate that they are already in sync.
 * Though, it's important to note that having the same document count does not guarantee
 * that the documents are identical, but it is a quick check to potentially avoid unnecessary replication.
 *
 * 2. If the counts do not match, get the distinct document IDs from both databases and compare them
 * to find out which ones are missing in the destination database. This step is essential to identify
 * the specific documents that need to be replicated, rather than syncing all documents again.
 * Sync only the missing documents from the source database to the destination database,
 *
 * 3. Delete any extra documents in the destination database that are not present in the source database.
 *
 * 4. Run the onComplete callback function if provided. This allows for any additional actions to be performed after
 * the replication process is complete, such as logging, flushing writers or any other necessary cleanup tasks.
 */
export async function replicate<SourceDocType>({ countDestinationDbFn, countSourceDbFn, deleteDestinationDbFn, distinctDestinationDbFn, distinctSourceDbFn, missingDocumentsSourceDbAsyncIterator, onCompleteCallbackFn, writeSourceDocumentFn }: ReplicateProps<SourceDocType>) {
	//

	const globalTimer = new Timer();

	//
	// Run the count functions for both databases, if enabled, to get the total number
	// of documents that match a given query. This is done to check if the document count
	// is the same for both databases, which would indicate that all documents are already synced.

	const countStepTimer = new Timer();

	const sourceDbCount = await countSourceDbFn();
	const destinationDbCount = await countDestinationDbFn();

	if (sourceDbCount === destinationDbCount) {
		Logger.success(`MATCH: Found the same number of documents in both databases: ${sourceDbCount} Source = ${destinationDbCount} Destination (${countStepTimer.get()})`);
		return;
	}

	Logger.info(`MISMATCH: Document count was different for both databases: ${sourceDbCount} Source != ${destinationDbCount} Destination (${countStepTimer.get()})`);

	//
	// If the document count was different, then check which documents are missing.
	// Instead of syncing all documents again, only the missing IDs are synced.
	// This is done to get the distinct values from each database and comparing
	// them to find the missing ones.

	const distinctStepTimer = new Timer();

	const sourceDbDocIds = await distinctSourceDbFn();
	const sourceDbDocIdsUnique = new Set(sourceDbDocIds);

	const destinationDbDocIds = await distinctDestinationDbFn();
	const destinationDbDocIdsUnique = new Set(destinationDbDocIds);

	const missingDocumentIds = sourceDbDocIds.filter((documentId: string) => !destinationDbDocIdsUnique.has(documentId));

	const extraDocumentIds = destinationDbDocIds.filter(doc => !sourceDbDocIdsUnique.has(doc));

	Logger.info(`Source Total: ${sourceDbCount} | Source Unique: ${sourceDbDocIdsUnique.size} | Source ▲: ${sourceDbCount - sourceDbDocIdsUnique.size} | Destination Total: ${destinationDbCount} | Destination Unique: ${destinationDbDocIdsUnique.size} | Destination ▲: ${destinationDbCount - destinationDbDocIdsUnique.size} | Destination Missing: ${missingDocumentIds.length} | Destination Extra: ${extraDocumentIds.length} (${distinctStepTimer.get()})`);

	if (missingDocumentIds.length === 0) {
		Logger.success(`Chunk complete. All document IDs matched. (${distinctStepTimer.get()})`);
		return;
	}

	//
	// Extra documents in the destination database should be removed,
	// as they are not present in the source database.

	const deleteStepTimer = new Timer();

	if (extraDocumentIds.length > 0 && deleteDestinationDbFn) {
		await deleteDestinationDbFn(extraDocumentIds);
		Logger.info(`Deleted ${extraDocumentIds.length} extra documents in the Destination database. (${deleteStepTimer.get()})`);
	}

	//
	// If there are missing documents, then they are synced.
	// We query the Source database for the missing documents
	// and write them to the Destination database.

	const missingStepTimer = new Timer();

	Logger.info(`Found ${missingDocumentIds.length} missing documents in the Destination database. (${missingStepTimer.get()})`);

	for await (const sourceDbDocument of missingDocumentsSourceDbAsyncIterator(missingDocumentIds)) {
		await writeSourceDocumentFn(sourceDbDocument);
	}

	//
	// After syncing the missing documents,
	// run the onComplete callback function if provided.

	if (onCompleteCallbackFn) await onCompleteCallbackFn();

	Logger.success(`Replication complete (${globalTimer.get()})`);

	//
}
