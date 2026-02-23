/* * */

import { IStorageProvider } from '@/providers/storage/storage.interface.js';
import { HttpException, HTTP_STATUS } from '@tmlmobilidade/consts';
import { mimeTypes } from '@tmlmobilidade/consts';
import { readFileSync } from 'node:fs';
import { Readable } from 'node:stream';
import { OciError, Region, SimpleAuthenticationDetailsProvider } from 'oci-common';
import { ObjectStorageClient, UploadManager } from 'oci-objectstorage';
import { CreatePreauthenticatedRequestDetails } from 'oci-objectstorage/lib/model/create-preauthenticated-request-details.js';

/* * */

export interface OCIStorageProviderConfiguration {
	bucket_name: string
	fingerprint: string
	namespace: string
	private_key: string
	region: string
	tenancy: string
	user: string
}

/* * */

export class OCIStorageProvider implements IStorageProvider {
	private readonly bucketName: string;
	private readonly namespace: string;
	private readonly ociClient: ObjectStorageClient;
	private readonly region: Region;

	constructor(config: OCIStorageProviderConfiguration) {
		this.ociClient = new ObjectStorageClient({
			authenticationDetailsProvider: new SimpleAuthenticationDetailsProvider(
				config.tenancy,
				config.user,
				config.fingerprint,
				readFileSync(config.private_key, 'utf8'),
				null,
				Region.fromRegionId(config.region),
			),
		});
		this.region = Region.fromRegionId(config.region);
		this.namespace = config.namespace;
		this.bucketName = config.bucket_name;
	}

	/**
	 * Copies a file from one location to another in the same bucket.
	 * @param source - The source object name.
	 * @param destination - The destination object name.
	 */
	async copyFile(source: string, destination: string): Promise<void> {
		await this.ociClient.copyObject({
			bucketName: this.bucketName,
			copyObjectDetails: {
				destinationBucket: this.bucketName,
				destinationNamespace: this.namespace,
				destinationObjectName: destination,
				destinationRegion: this.region.regionId,
				sourceObjectName: source,
			},
			namespaceName: this.namespace,
		});
	}

	async deleteFile(key: string): Promise<void> {
		await this.ociClient.deleteObject({
			bucketName: this.bucketName,
			namespaceName: this.namespace,
			objectName: key,
		});
	}

	async deleteFiles(keys: string[]): Promise<void> {
		await Promise.all(keys.map(key => this.deleteFile(key)));
	}

	async fileExists(key: string): Promise<boolean> {
		try {
			await this.ociClient.headObject({
				bucketName: this.bucketName,
				namespaceName: this.namespace,
				objectName: key,
			});
			return true;
		}
		catch (error: unknown) {
			if (error instanceof OciError && error.statusCode === 404) return false;
			throw error;
		}
	}

	async getFileUrl(key: string): Promise<string> {
		if (!await this.fileExists(key)) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, `File ${key} does not exist in bucket ${this.bucketName}`);
		}

		const response = await this.ociClient.createPreauthenticatedRequest({
			bucketName: this.bucketName,
			createPreauthenticatedRequestDetails: {
				accessType: CreatePreauthenticatedRequestDetails.AccessType.ObjectRead,
				name: 'public-download-link',
				objectName: key,
				timeExpires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
			},
			namespaceName: this.namespace,
		});

		return `https://objectstorage.${this.region.regionId}.oraclecloud.com${response.preauthenticatedRequest.accessUri}`;
	}

	async listFiles(prefix?: string): Promise<string[]> {
		const result = await this.ociClient.listObjects({
			bucketName: this.bucketName,
			namespaceName: this.namespace,
			prefix,
		});
		return result.listObjects?.objects?.map(obj => obj.name) ?? [];
	}

	async uploadFile(key: string, body: Buffer | Readable | ReadableStream, mimeType?: string): Promise<void> {
		const isImage = mimeType === mimeTypes.png || mimeType === mimeTypes.jpg || mimeType === mimeTypes.jpeg || mimeType === mimeTypes.gif || mimeType === mimeTypes.svg;
		const uploadManager = new UploadManager(this.ociClient, { enforceMD5: true });

		try {
			await uploadManager.upload({
				content: body instanceof Buffer
					? { blob: new Blob([new Uint8Array(body)], { type: mimeType }) }
					: { stream: body },
				requestDetails: {
					bucketName: this.bucketName,
					contentDisposition: isImage ? 'inline' : 'attachment',
					contentType: mimeType,
					namespaceName: this.namespace,
					objectName: key,
				},
			});
		}
		catch (error) {
			console.error('Error uploading file:', JSON.stringify(error, null, 2));
			throw error;
		}
	}
}
