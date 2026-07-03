/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { IStorageProvider, StorageFactory } from '@/providers/index.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { Files } from '@tmlmobilidade/files';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type CreateFileDto, CreateFileSchema, type File, type UpdateFileDto, UpdateFileSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy, convertObject } from '@tmlmobilidade/utils';
import { DeleteOptions, DeleteResult, FindOptions, IndexDescription, InsertOneOptions, WithId } from 'mongodb';
import { Readable } from 'node:stream';
import { z } from 'zod';

/* * */

class FilesClass extends MongoCollectionClass<File, CreateFileDto, UpdateFileDto> {
	//

	private static _instance: FilesClass;

	protected override createSchema: z.ZodSchema = CreateFileSchema;
	protected override updateSchema: z.ZodSchema = UpdateFileSchema;

	private readonly bucketName: string;
	private readonly storageService: IStorageProvider;

	private constructor() {
		super();

		switch (process.env.STORAGE_TYPE) {
			case 'oci':
				if (!process.env.OCI_PRIVATE_KEY && !process.env.OCI_PRIVATE_KEY_PATH) {
					throw new Error('Either OCI_PRIVATE_KEY or OCI_PRIVATE_KEY_PATH must be set');
				}
				if (!process.env.OCI_BUCKET_NAME || !process.env.OCI_FINGERPRINT || !process.env.OCI_NAMESPACE || !process.env.OCI_REGION || !process.env.OCI_TENANCY || !process.env.OCI_USER) {
					throw new Error('OCI_BUCKET_NAME, OCI_FINGERPRINT, OCI_NAMESPACE, OCI_REGION, OCI_TENANCY, and OCI_USER must be set');
				}
				this.bucketName = process.env.OCI_BUCKET_NAME;
				this.storageService = StorageFactory.create({
					oci_config: {
						bucket_name: process.env.OCI_BUCKET_NAME,
						fingerprint: process.env.OCI_FINGERPRINT,
						namespace: process.env.OCI_NAMESPACE,
						private_key: process.env.OCI_PRIVATE_KEY,
						private_key_path: process.env.OCI_PRIVATE_KEY_PATH,
						region: process.env.OCI_REGION,
						tenancy: process.env.OCI_TENANCY,
						user: process.env.OCI_USER,
					},
					type: 'oci',
				});
				break;
			default:
				throw new Error(`Invalid storage type: ${process.env.STORAGE_TYPE}`);
		}
	}

	public static async getInstance() {
		if (!FilesClass._instance) {
			const instance = new FilesClass();
			await instance.connect();
			FilesClass._instance = instance;
		}
		return FilesClass._instance;
	}

	/**
	 * Clones a file from one resource to another.
	 * @param fileId - The unique identifier of the file in the database.
	 * @param resourceId - The unique identifier of the resource to clone the file to.
	 * @returns The file that was cloned.
	 */
	public async clone(fileId: string, scope: string, resourceId: string, options?: InsertOneOptions): Promise<File> {
		const _id = generateRandomString({ length: 5 });
		const file = await this.findOne({ _id: fileId });
		if (!file) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');

		const originalFilePath = `${file.scope}/${file.resource_id}/${file._id}.${Files.getFileExtension(file.name)}`;
		const newFilePath = `${scope}/${resourceId}/${_id}.${Files.getFileExtension(file.name)}`;

		await this.storageService.copyFile(originalFilePath, newFilePath);

		const newFile = convertObject(file, CreateFileSchema);
		return await this.insertOne({ ...newFile, _id, resource_id: resourceId, scope }, { options });
	}

	/**
	 * Deletes a file from the storage service and the database.
	 * @param fileId - The unique identifier of the file in the database.
	 * @returns The file that was deleted.
	 */
	public override async deleteById(fileId: string, options?: DeleteOptions): Promise<DeleteResult> {
		const foundFile = await this.findById(fileId);
		if (!foundFile) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');
		await this.storageService.deleteFile(`${foundFile.scope}/${foundFile.resource_id}/${foundFile._id}.${Files.getFileExtensionFromMimeType(foundFile.type)}`);
		return await super.deleteById(fileId, { ...options, forceIfLocked: true });
	}

	/**
	 * Retrieves a file from the database and adds the signed URL to the file object.
	 * @param file_id - The unique identifier of the file in the database.
	 * @returns The file with the signed URL.
	 */
	public override async findById(id: string, options?: FindOptions): Promise<null | WithId<File>> {
		const file = await super.findById(id, options);
		if (!file) {
			return null;
		}

		file.url = await this.getFileUrl({ file_id: file._id }, options);
		return file;
	}

	/**
	 * Retrieves the signed URL of a file from the storage service.
	 * @param params - Object containing either `file_id` or `key`.
	 * @param params.file_id - The unique identifier of the file in the database.
	 * @param params.key - The storage key of the file.
	 * @param options - Optional options.
	 * @returns The signed URL of the file.
	 * @throws {Error} If neither `file_id` nor `key` is provided.
	 * @throws {HttpException} If `file_id` is provided but the file is not found.
	*/
	public async getFileUrl({ file_id, key }: { file_id?: string, key?: string }, options?: FindOptions): Promise<string> {
		if (!file_id && !key) {
			throw new Error('Either "file_id" or "key" must be provided');
		}

		// If `file_id` is provided, fetch the file and use its key
		let file: File | null = null;
		if (file_id) {
			file = await this.findOne({ _id: file_id }, options);
			if (!file) {
				throw new HttpException(HTTP_STATUS.NOT_FOUND, 'File not found');
			}
			key = `${file.scope}/${file.resource_id}/${file._id}.${Files.getFileExtension(file.name)}`; // Use the file's storage key
		}

		// Check if key exists
		const keyExists = await this.storageService.fileExists(key as string);
		if (!keyExists) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, `Key ${key} does not exist in bucket ${this.bucketName}`);
		}

		// At this point, `key` must exist
		return this.storageService.getFileUrl(key as string);
	}

	/**
	 * Uploads a file to the storage service and inserts it into the database.
	 * @param file - The file to upload, either as a string, buffer, or readable stream.
	 * @param createFileDto - The file type to create.
	 * @returns The file that was uploaded.
	 */
	public async upload(file: Buffer | Readable | ReadableStream | string, createFileDto: CreateFileDto & { _id?: string }, options?: InsertOneOptions & { override?: boolean }): Promise<File> {
		//

		//
		// A. Define variables
		if (createFileDto._id && !options?.override) {
			throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'When File ID is provided, override must be true');
		}

		const fileId = createFileDto._id || generateRandomString({ length: 5 });
		const fileExtension = Files.getFileExtension(createFileDto.name);
		const mimeType = Files.getMimeTypeFromFileExtension(createFileDto.name);
		const filePath = `${createFileDto.scope}/${createFileDto.resource_id}/${fileId}.${fileExtension}`;

		//
		// C. Handle database transaction
		const session = this.getMongoConnector().client.startSession();
		let result: File;

		try {
			session.startTransaction();

			//
			// C.1. Handle file override if specified
			if (options?.override) {
				const existingFile = await this.findOne({ _id: fileId });

				if (existingFile) {
					const existingFileExtension = Files.getFileExtension(existingFile.name);
					const existingFilePath = `${existingFile.scope}/${existingFile.resource_id}/${existingFile._id}.${existingFileExtension}`;

					if (existingFilePath !== filePath) {
						throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'File ID is provided, but the file path is different from the existing file', { cause: { existingFilePath, filePath } });
					}

					await super.deleteById(fileId);
				}
			}

			//
			// C.2. Upload file to storage
			await this.storageService.uploadFile(filePath, file, mimeType);

			//
			// C.3. Insert file record
			result = await this.insertOne({ ...createFileDto, _id: fileId, type: mimeType }, { options });
			await session.commitTransaction();
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			await session.endSession();
		}

		return result;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { created_by: 1 } },
			{ background: true, key: { updated_by: 1 } },
			{ background: true, key: { name: 1 } },
			{ background: true, key: { type: 1 } },
			{ background: true, key: { created_at: -1 } },
			{ background: true, key: { updated_at: -1 } },
		];
	}

	protected getCollectionName(): string {
		return 'files';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const files = asyncSingletonProxy(FilesClass);
