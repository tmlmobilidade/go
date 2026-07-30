/* * */

import { HTTP_STATUS, HttpException, mimeTypes } from '@tmlmobilidade/consts';
import { Logger } from '@tmlmobilidade/logger';
import { withRetry } from '@tmlmobilidade/utils';
import { readFileSync } from 'node:fs';
import { Readable } from 'node:stream';
import { OciError, Region, SimpleAuthenticationDetailsProvider } from 'oci-common';
import { ObjectStorageClient, UploadManager } from 'oci-objectstorage';
import { CreatePreauthenticatedRequestDetails } from 'oci-objectstorage/lib/model/create-preauthenticated-request-details.js';

import { BlobStoreError, NotFoundError } from './storage-error.js';

/**
 * Configuration for an OCI Object Storage client.
 *
 * Every OCI Storage client follows the same env var naming convention,
 * scoped by `prefix`:
 *   `{PREFIX}_BUCKET_NAME` / `{PREFIX}_NAMESPACE` — bucket identity
 *   `{PREFIX}_REGION` — region identifier (e.g. `eu-frankfurt-1`)
 *   `{PREFIX}_TENANCY` / `{PREFIX}_USER` / `{PREFIX}_FINGERPRINT` — auth
 *   `{PREFIX}_PRIVATE_KEY` / `{PREFIX}_PRIVATE_KEY_PATH` — key (one required)
 *
 * @example
 * ```ts
 * const client = await OCIStorageClient.getClient({ prefix: 'OCI_STORAGE' })
 * ```
 */
export interface OCIStorageConfig {
	/** Env var prefix (e.g. `"OCI_STORAGE"`). */
	prefix: string
}

/**
 * Internal bookkeeping for an active OCI Storage client.
 */
interface OCIStorageEntry {
	bucketName: string
	client: ObjectStorageClient
	namespace: string
	region: Region
}

/**
 * High-level wrapper around an OCI Object Storage client.
 *
 * Binds a bucket name, namespace, and region so callers don't repeat them
 * on every call. Provides the same convenience methods as the original
 * `OCIStorageProvider` for a drop-in migration path.
 */
export class OCIStorageClientWrapper {
	constructor(private readonly entry: OCIStorageEntry) {}

	/**
	 * Copies a file from one object key to another within the same bucket.
	 * @param source - The source object key.
	 * @param destination - The destination object key.
	 */
	async copyFile(source: string, destination: string): Promise<void> {
		try {
			await withRetry(() => this.entry.client.copyObject({
				bucketName: this.entry.bucketName,
				copyObjectDetails: {
					destinationBucket: this.entry.bucketName,
					destinationNamespace: this.entry.namespace,
					destinationObjectName: destination,
					destinationRegion: this.entry.region.regionId,
					sourceObjectName: source,
				},
				namespaceName: this.entry.namespace,
			}));
		} catch (error) {
			this.throwBlobStoreError(error, { destination, source });
		}
	}

	/**
	 * Deletes a single object by key.
	 * @param key - The object key to delete.
	 */
	async deleteFile(key: string): Promise<void> {
		try {
			await withRetry(() => this.entry.client.deleteObject({
				bucketName: this.entry.bucketName,
				namespaceName: this.entry.namespace,
				objectName: key,
			}));
		} catch (error) {
			this.throwBlobStoreError(error, { key });
		}
	}

	/**
	 * Deletes multiple objects by key. Rejects on the first error.
	 * @param keys - The object keys to delete.
	 */
	async deleteFiles(keys: string[]): Promise<void> {
		try {
			await Promise.all(keys.map(key => this.entry.client.deleteObject({
				bucketName: this.entry.bucketName,
				namespaceName: this.entry.namespace,
				objectName: key,
			})));
		} catch (error) {
			this.throwBlobStoreError(error, { keys });
		}
	}

	/**
	 * Checks whether an object exists in the bucket.
	 * @param key - The object key to check.
	 * @returns `true` if the object exists, `false` if a 404 is returned.
	 */
	async fileExists(key: string): Promise<boolean> {
		try {
			return await withRetry(async () => {
				try {
					await this.entry.client.headObject({
						bucketName: this.entry.bucketName,
						namespaceName: this.entry.namespace,
						objectName: key,
					});
					return true;
				} catch (error: unknown) {
					if (error instanceof OciError && error.statusCode === 404) return false;
					throw error;
				}
			});
		} catch (error) {
			this.throwBlobStoreError(error, { key });
		}
	}

	/**
	 * Generates a pre-authenticated download URL for an object, valid for 1 hour.
	 * @param key - The object key.
	 * @returns A public HTTPS URL to download the object.
	 * @throws {HttpException} 404 if the object does not exist.
	 */
	async getFileUrl(key: string): Promise<string> {
		try {
			return await withRetry(async () => {
				try {
					await this.entry.client.headObject({
						bucketName: this.entry.bucketName,
						namespaceName: this.entry.namespace,
						objectName: key,
					});
				} catch (error: unknown) {
					if (error instanceof OciError && error.statusCode === 404) {
						throw new HttpException(HTTP_STATUS.NOT_FOUND, `File ${key} does not exist in bucket ${this.entry.bucketName}`);
					}
					throw error;
				}

				const response = await this.entry.client.createPreauthenticatedRequest({
					bucketName: this.entry.bucketName,
					createPreauthenticatedRequestDetails: {
						accessType: CreatePreauthenticatedRequestDetails.AccessType.ObjectRead,
						name: 'public-download-link',
						objectName: key,
						timeExpires: new Date(Date.now() + 1000 * 60 * 60),
					},
					namespaceName: this.entry.namespace,
				});

				return `https://objectstorage.${this.entry.region.regionId}.oraclecloud.com${response.preauthenticatedRequest.accessUri}`;
			});
		} catch (error) {
			this.throwBlobStoreError(error, { key });
		}
	}

	/**
	 * Lists object keys in the bucket, optionally filtered by a prefix.
	 * @param prefix - Optional prefix to filter by.
	 * @returns An array of object keys.
	 */
	async listFiles(prefix?: string): Promise<string[]> {
		try {
			return await withRetry(async () => {
				const result = await this.entry.client.listObjects({
					bucketName: this.entry.bucketName,
					namespaceName: this.entry.namespace,
					prefix,
				});
				return result.listObjects?.objects?.map(obj => obj.name) ?? [];
			});
		} catch (error) {
			this.throwBlobStoreError(error, { prefix });
		}
	}

	/**
	 * Uploads a file to the bucket.
	 *
	 * Uses the OCI `UploadManager` for resumable uploads with MD5 enforcement.
	 * Images are stored with `Content-Disposition: inline`; everything else
	 * uses `attachment`.
	 * @param key - The destination object key.
	 * @param body - The file contents as a Buffer, Readable, or ReadableStream.
	 * @param mimeType - Optional MIME type (e.g. `image/png`).
	 */
	async uploadFile(key: string, body: Buffer | Readable | ReadableStream, mimeType?: string): Promise<void> {
		const isImage = mimeType === mimeTypes.png || mimeType === mimeTypes.jpg || mimeType === mimeTypes.jpeg || mimeType === mimeTypes.gif || mimeType === mimeTypes.svg;
		const uploadManager = new UploadManager(this.entry.client, { enforceMD5: true });

		try {
			// Uploads are not safely retried (streams may be consumed).
			await uploadManager.upload({
				content: body instanceof Buffer
					? { blob: new Blob([new Uint8Array(body)], { type: mimeType }) }
					: { stream: body },
				requestDetails: {
					bucketName: this.entry.bucketName,
					contentDisposition: isImage ? 'inline' : 'attachment',
					contentType: mimeType,
					namespaceName: this.entry.namespace,
					objectName: key,
				},
			});
		} catch (error) {
			this.throwBlobStoreError(error, { key, mimeType });
		}
	}

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

/**
 * Singleton-per-prefix factory for OCI Object Storage client wrappers.
 *
 * Each `prefix` maps to one client wrapper, created once and cached. Env vars
 * are resolved at creation time using the prefix.
 *
 * @example
 * ```ts
 * const client = await OCIStorageClient.getClient({ prefix: 'OCI_STORAGE' })
 * await client.uploadFile('path/to/file.pdf', buffer)
 * ```
 */
export class OCIStorageClient {
	private static entries = new Map<string, Promise<OCIStorageEntry>>();

	/**
	 * Gracefully tear down all active OCI Storage clients and clear the
	 * internal cache so subsequent `getClient` calls re-connect.
	 *
	 * Note: The OCI SDK's `ObjectStorageClient` has no explicit close method,
	 * so this primarily clears the cache and logs disconnection.
	 */
	static async disconnectAll(): Promise<void> {
		const settlements = await Promise.allSettled(this.entries.values());
		for (const settlement of settlements) {
			if (settlement.status === 'fulfilled') {
				// OCISDK ObjectStorageClient has no explicit close/disconnect.
				Logger.info({ message: `[OCIStorage] Disconnected client for namespace ${settlement.value.namespace}.` });
			}
		}
		this.entries.clear();
	}

	/**
	 * Get (or create) an OCI Storage client wrapper for the given config.
	 *
	 * Each unique `prefix` produces a singleton wrapper. The first call
	 * validates required environment variables, creates the OCI SDK client,
	 * and caches it. Subsequent calls return the cached wrapper immediately.
	 *
	 * @param config - Storage configuration (env var prefix).
	 * @returns A wrapper with convenience methods bound to the resolved bucket.
	 * @throws If required env vars are missing or OCI auth fails.
	 */
	static async getClient(config: OCIStorageConfig): Promise<OCIStorageClientWrapper> {
		const key = config.prefix;

		if (!this.entries.has(key)) {
			const promise = this.createClient(config).catch((error) => {
				this.entries.delete(key);
				throw error;
			});
			this.entries.set(key, promise);
		}

		const entry = await this.entries.get(key);
		if (!entry) throw new Error(`OCI Storage client not found for prefix ${key}`);
		return new OCIStorageClientWrapper(entry);
	}

	/**
	 * Create a new `OCIStorageEntry` by resolving environment variables and
	 * instantiating the OCI SDK `ObjectStorageClient`.
	 *
	 * Validates that all required env vars for the chosen auth mode (inline
	 * key or key file path) are set. On failure the cache entry is removed so
	 * retries work.
	 */
	private static async createClient(config: OCIStorageConfig): Promise<OCIStorageEntry> {
		//

		//
		// Setup a function to get the environment variable by prefix

		const env = (name: string) => process.env[`${config.prefix}_${name}`];

		//
		// Check if all required environment variables are set

		Logger.info({ message: `[${config.prefix}] Creating OCI Storage client...` });

		const bucketName = env('BUCKET_NAME');
		if (!bucketName) throw new Error(`${config.prefix}_BUCKET_NAME is not set`);

		const namespace = env('NAMESPACE');
		if (!namespace) throw new Error(`${config.prefix}_NAMESPACE is not set`);

		const region = env('REGION');
		if (!region) throw new Error(`${config.prefix}_REGION is not set`);

		const tenancy = env('TENANCY');
		if (!tenancy) throw new Error(`${config.prefix}_TENANCY is not set`);

		const user = env('USER');
		if (!user) throw new Error(`${config.prefix}_USER is not set`);

		const fingerprint = env('FINGERPRINT');
		if (!fingerprint) throw new Error(`${config.prefix}_FINGERPRINT is not set`);

		//
		// Resolve private key

		const privateKeyPath = env('PRIVATE_KEY_PATH');
		const privateKeyValue = env('PRIVATE_KEY');
		if (!privateKeyPath && !privateKeyValue) throw new Error(`${config.prefix}_PRIVATE_KEY or ${config.prefix}_PRIVATE_KEY_PATH is not set`);

		let privateKey: string;
		if (privateKeyPath) privateKey = readFileSync(privateKeyPath, 'utf8');
		else if (privateKeyValue) privateKey = privateKeyValue.replace(/\\n/g, '\n');
		else throw new Error(`Could not resolve private key for ${config.prefix} (missing ${config.prefix}_PRIVATE_KEY or ${config.prefix}_PRIVATE_KEY_PATH)`);

		//
		// Create OCI Storage client

		const client = new ObjectStorageClient({
			authenticationDetailsProvider: new SimpleAuthenticationDetailsProvider(
				tenancy,
				user,
				fingerprint,
				privateKey,
				null,
				Region.fromRegionId(region),
			),
		});

		Logger.info({ message: `[${config.prefix}] OCI Storage client created.` });

		return {
			bucketName,
			client,
			namespace,
			region: Region.fromRegionId(region),
		};
	}
}
