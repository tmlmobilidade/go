/* * */

import { BlobBody } from '@/types/blob-body.js';
import { BlobStoreError, NotFoundError } from '@/types/storage-error.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type OCIStorageClientWrapper } from '@tmlmobilidade/go-clients-oci-storage';
import { withRetry } from '@tmlmobilidade/utils';

/* * */

/**
 * OciBlobStore provides blob storage operations using an OCIStorageClientWrapper.
 *
 * Methods include copy, delete, deleteMany, exists, getUrl, and list, which interact
 * with an OCI-compatible object storage backend. Errors are wrapped as BlobStoreError
 * or NotFoundError when appropriate.
 */
export class OciBlobStore {
	//
	//

	//
	constructor(private readonly client: OCIStorageClientWrapper) {}

	/**
	 * Copies a blob from the source key to the destination key.
	 * Retries the operation on transient failures.
	 * @param source - The source object key.
	 * @param destination - The destination object key.
	 * @throws {BlobStoreError | NotFoundError}
	 */
	async copy(source: string, destination: string): Promise<void> {
		try {
			await withRetry(() => this.client.copyFile(source, destination));
		} catch (error) {
			this.throwBlobStoreError(error, { destination, source });
		}
	}

	/**
	 * Deletes a blob at the given key.
	 * Retries the operation on transient failures.
	 * @param key - The object key to delete.
	 * @throws {BlobStoreError | NotFoundError}
	 */
	async delete(key: string): Promise<void> {
		try {
			await withRetry(() => this.client.deleteFile(key));
		} catch (error) {
			this.throwBlobStoreError(error, { key });
		}
	}

	/**
	 * Deletes multiple blobs identified by the given keys.
	 * Does not automatically retry, as the underlying client
	 * is expected to handle partial failures gracefully.
	 * @param keys - Array of object keys to delete.
	 * @throws {BlobStoreError | NotFoundError}
	 */
	async deleteMany(keys: string[]): Promise<void> {
		try {
			await this.client.deleteFiles(keys);
		} catch (error) {
			this.throwBlobStoreError(error, { keys });
		}
	}

	/**
	 * Checks if a blob exists at the given key.
	 * Retries the operation on transient failures.
	 * @param key - The object key to check.
	 * @returns True if the blob exists, otherwise false.
	 * @throws {BlobStoreError | NotFoundError}
	 */
	async exists(key: string): Promise<boolean> {
		try {
			return await withRetry(() => this.client.fileExists(key));
		} catch (error) {
			this.throwBlobStoreError(error, { key });
		}
	}

	/**
	 * Retrieves a signed URL for the given blob key.
	 * Retries the operation on transient failures.
	 * @param key - The object key to get the URL for.
	 * @returns The signed URL for accessing the blob.
	 * @throws {BlobStoreError | NotFoundError}
	 */
	async getUrl(key: string): Promise<string> {
		try {
			return await withRetry(() => this.client.getFileUrl(key));
		} catch (error) {
			this.throwBlobStoreError(error, { key });
		}
	}

	/**
	 * Lists blob keys under the given prefix.
	 * Retries the operation on transient failures.
	 * @param prefix - The prefix to filter blob keys (optional).
	 * @returns An array of matching object keys.
	 * @throws {BlobStoreError | NotFoundError}
	 */
	async list(prefix?: string): Promise<string[]> {
		try {
			return await withRetry(() => this.client.listFiles(prefix));
		} catch (error) {
			this.throwBlobStoreError(error, { prefix });
		}
	}

	/**
	 * Uploads a blob to the given key.
	 * Not retried automatically, as upload streams may not be repeatable.
	 * @param key - The object key to upload to.
	 * @param body - The blob contents (stream, buffer, or string).
	 * @param mimeType - The MIME type of the blob (optional).
	 * @throws {BlobStoreError | NotFoundError}
	 */
	async put(key: string, body: BlobBody, mimeType?: string): Promise<void> {
		try {
			// Uploads are not safely retried (streams may be consumed).
			await this.client.uploadFile(key, body, mimeType);
		} catch (error) {
			this.throwBlobStoreError(error, { key, mimeType });
		}
	}

	/**
	 * Throws a BlobStoreError or NotFoundError with additional operation context,
	 * wrapping the original error.
	 * @param error - The caught error object.
	 * @param context - Additional context relevant to the failed operation.
	 * @throws {BlobStoreError | NotFoundError}
	 */
	private throwBlobStoreError(error: unknown, context: Record<string, unknown>): never {
		if (error instanceof HttpException && error.statusCode === HTTP_STATUS.NOT_FOUND) {
			throw new NotFoundError(error.message, { cause: error, context });
		}
		throw new BlobStoreError(error instanceof Error ? error.message : String(error), {
			cause: error,
			context,
			retryable: true,
		});
	}
}
