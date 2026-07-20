/* * */

import { HTTP_STATUS, HttpException, mimeTypes } from '@tmlmobilidade/consts';
import { OCIStorageClient, type OCIStorageClientWrapper } from '@tmlmobilidade/go-clients-oci-storage';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type CreateFileDto, CreateFileSchema, type File } from '@tmlmobilidade/types';
import { asyncSingletonProxy, convertObject } from '@tmlmobilidade/utils';
import { type Readable } from 'node:stream';

/* * */

class StorageProviderClass {
	private static _instance: StorageProviderClass;

	private constructor(private readonly ociStorageClient: OCIStorageClientWrapper) {}

	public static async getInstance() {
		if (!StorageProviderClass._instance) {
			const ociStorageClient = await OCIStorageClient.getClient({ prefix: 'OCI_STORAGE' });
			StorageProviderClass._instance = new StorageProviderClass(ociStorageClient);
		}
		return StorageProviderClass._instance;
	}

	/**
	 * Clones a file from one resource to another.
	 * Copies the object in OCI and inserts a new MongoDB record.
	 */
	async clone(fileId: string, scope: string, resourceId: string): Promise<File> {
		const _id = generateRandomString({ length: 5 });
		const file = await goDb.core.files.findOne({ _id: { $eq: fileId } });
		if (!file) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');

		const originalFilePath = this.getStorageKey(file);
		const newFilePath = `${scope}/${resourceId}/${_id}.${getFileExtension(file.name)}`;

		await this.ociStorageClient.copyFile(originalFilePath, newFilePath);

		const newFile = convertObject(file, CreateFileSchema);
		return await goDb.core.files.insertOne({ ...newFile, _id, resource_id: resourceId, scope });
	}

	/**
	 * Deletes a file from OCI and MongoDB.
	 */
	async deleteById(fileId: string) {
		const foundFile = await goDb.core.files.findById(fileId);
		if (!foundFile) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');

		await this.ociStorageClient.deleteFile(
			`${foundFile.scope}/${foundFile.resource_id}/${foundFile._id}.${getFileExtensionFromMimeType(foundFile.type)}`,
		);

		return await goDb.core.files.deleteById(fileId, { forceIfLocked: true });
	}

	/**
	 * Retrieves a file from MongoDB and attaches a signed OCI URL.
	 */
	async findById(id: string): Promise<File | null> {
		const file = await goDb.core.files.findById(id);
		if (!file) return null;

		file.url = await this.getFileUrl({ fileId: file._id });
		return file;
	}

	/**
	 * Returns a signed download URL for a file, by MongoDB id or OCI object key.
	 */
	async getFileUrl({ fileId, key }: { fileId?: string, key?: string }): Promise<string> {
		if (!fileId && !key) {
			throw new Error('Either "fileId" or "key" must be provided');
		}

		if (fileId) {
			const file = await goDb.core.files.findOne({ _id: { $eq: fileId } });
			if (!file) {
				throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');
			}
			key = this.getStorageKey(file);
		}

		return this.ociStorageClient.getFileUrl(key as string);
	}

	/**
	 * Uploads a file to OCI and inserts the corresponding MongoDB record.
	 */
	async upload(
		file: Buffer | Readable | ReadableStream,
		createFileDto: CreateFileDto & { _id?: string },
		options?: { override?: boolean },
	): Promise<File> {
		if (createFileDto._id && !options?.override) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'When File ID is provided, override must be true');
		}

		const fileId = createFileDto._id || generateRandomString({ length: 5 });
		const fileExtension = getFileExtension(createFileDto.name);
		const mimeType = getMimeTypeFromFileExtension(createFileDto.name);
		const filePath = `${createFileDto.scope}/${createFileDto.resource_id}/${fileId}.${fileExtension}`;

		if (options?.override) {
			const existingFile = await goDb.core.files.findOne({ _id: { $eq: fileId } });

			if (existingFile) {
				const existingFilePath = this.getStorageKey(existingFile);

				if (existingFilePath !== filePath) {
					throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'File ID is provided, but the file path is different from the existing file', { cause: { existingFilePath, filePath } });
				}

				await goDb.core.files.deleteById(fileId, { forceIfLocked: true });
			}
		}

		await this.ociStorageClient.uploadFile(filePath, file, mimeType);

		return await goDb.core.files.insertOne({ ...createFileDto, _id: fileId, type: mimeType });
	}

	private getStorageKey(file: Pick<File, '_id' | 'name' | 'resource_id' | 'scope'>): string {
		return `${file.scope}/${file.resource_id}/${file._id}.${getFileExtension(file.name)}`;
	}
}

/* * */

function getFileExtension(fileName: string): string {
	const extension = fileName.split('.').pop()?.toLowerCase();
	if (!extension) throw new Error('File has no extension');
	if (!(extension in mimeTypes)) throw new Error(`Unsupported file extension: ${extension}`);
	return extension;
}

function getMimeTypeFromFileExtension(fileName: string): string {
	return mimeTypes[getFileExtension(fileName) as keyof typeof mimeTypes];
}

function getFileExtensionFromMimeType(mimeType: string): string {
	if (!mimeType) return '';
	return Object.keys(mimeTypes).find(key => mimeTypes[key as keyof typeof mimeTypes] === mimeType) ?? '';
}

/* * */

export const storageProvider = asyncSingletonProxy(StorageProviderClass);
