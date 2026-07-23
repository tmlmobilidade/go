/* * */

import { BlobBody } from '@/types/blob-body.js';
import { type StorageDeps } from '@/types/deps.js';
import { type OperationHooks } from '@/types/hooks.js';
import { type OperationContext } from '@/types/operation-context.js';
import { createLoggerObservability } from '@/utils/observability.js';
import { type Filter, type FindOptions } from '@tmlmobilidade/go-clients-mongo';
import { OCIStorageClient } from '@tmlmobilidade/go-clients-oci-storage';
import { type Attachment, type CreateAttachmentDto } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

import * as operations from './operations/index.js';

/* * */

class StorageProviderClass {
	//

	private static _instance: StorageProviderClass;

	private constructor(private readonly deps: StorageDeps) {}

	public static async getInstance() {
		if (!StorageProviderClass._instance) {
			const ociStorageClient = await OCIStorageClient.getClient({ prefix: 'OCI_STORAGE' });
			StorageProviderClass._instance = new StorageProviderClass({ blobs: ociStorageClient, observability: createLoggerObservability() });
		}
		return StorageProviderClass._instance;
	}

	/**
	 * Deletes multiple files by their IDs in a batch operation.
	 * @param fileIds - An array of file IDs to be deleted.
	 * @param hooks - Operation hooks for observability or side effects.
	 * @param options - Optional: Batch deletion settings such as concurrency.
	 * @returns A promise resolving to the batch result containing deleted fileIds.
	 */
	async batchDelete(fileIds: string[], hooks?: OperationHooks<OperationContext, operations.BatchResult<{ fileId: string }>>, options?: Pick<operations.BatchDeleteInput, 'concurrency'>): Promise<operations.BatchResult<{ fileId: string }>> {
		return operations.batchDelete(this.deps, { concurrency: options?.concurrency, fileIds, hooks });
	}

	/**
	 * Uploads multiple items in a batch operation.
	 * @param items - List of items to be uploaded.
	 * @param hooks - Operation hooks for the batch upload.
	 * @param options - Optional: Control concurrency for batch uploads.
	 * @returns A promise resolving to the batch upload result with attachments.
	 */
	async batchUpload(items: operations.BatchUploadItem[], hooks?: OperationHooks<OperationContext, operations.BatchResult<Attachment>>, options?: { concurrency?: number }): Promise<operations.BatchResult<Attachment>> {
		return operations.batchUpload(this.deps, { concurrency: options?.concurrency, hooks, items });
	}

	/**
	 * Copies a file to a new resource and scope.
	 * @param fileId - The ID of the file to copy.
	 * @param scope - The new scope for the copied file.
	 * @param resourceId - The ID of the new associated resource.
	 * @param hooks - Hooks for operation observability and behavior.
	 * @returns A promise resolving to the new copied Attachment.
	 */
	async copy(fileId: string, scope: string, resourceId: string, hooks?: OperationHooks<OperationContext, Attachment>): Promise<Attachment> {
		return operations.copy(this.deps, { fileId, hooks, resourceId, scope });
	}

	/**
	 * Deletes a single file by its ID.
	 * @param fileId - The ID of the file to delete.
	 * @param hooks - Hooks for operation side effects and observability.
	 * @returns A promise resolving with the deleted fileId.
	 */
	async delete(fileId: string, hooks?: OperationHooks<OperationContext, { fileId: string }>): Promise<{ fileId: string }> {
		return operations.deleteAttachment(this.deps, { fileId, hooks });
	}

	/**
	 * Checks for existence of a file by ID or key.
	 * @param params - An object containing fileId or key.
	 * @param hooks - Hooks for operation execution.
	 * @returns A promise resolving to the existence result.
	 */
	async exists(params: { fileId?: string, key?: string }, hooks?: OperationHooks<OperationContext, operations.ExistsResult>): Promise<operations.ExistsResult> {
		return operations.exists(this.deps, { ...params, hooks });
	}

	/**
	 * Finds a file attachment by its unique ID.
	 * @param id - The ID of the attachment.
	 * @param hooks - Hooks for operation execution.
	 * @returns A promise resolving to the Attachment or null if not found.
	 */
	async findById(id: string, hooks?: OperationHooks<OperationContext, Attachment | null>): Promise<Attachment | null> {
		return operations.findById(this.deps, { hooks, id });
	}

	/**
	 * Generates a signed URL for downloading or accessing a file.
	 * @param params - Parameters with fileId or key for which to generate the URL.
	 * @param hooks - Hooks for execution/observability.
	 * @returns A promise resolving to the signed URL as a string.
	 */
	async getSignedUrl(params: { fileId?: string, key?: string }, hooks?: OperationHooks<OperationContext, string>): Promise<string> {
		return operations.getSignedUrl(this.deps, { ...params, hooks });
	}

	/**
	 * Moves a file to a different resource and/or scope.
	 * @param fileId - ID of the file to move.
	 * @param scope - Target scope.
	 * @param resourceId - Target resource ID.
	 * @param hooks - Hooks for observability or side effects.
	 * @returns A promise resolving to the updated Attachment.
	 */
	async move(fileId: string, scope: string, resourceId: string, hooks?: OperationHooks<OperationContext, Attachment>): Promise<Attachment> {
		return operations.move(this.deps, { fileId, hooks, resourceId, scope });
	}

	/**
	 * Replaces an existing file's data while preserving its identifier.
	 * @param file - Blob body of the new file.
	 * @param createAttachmentDto - Data transfer object describing the attachment, must include _id.
	 * @param hooks - Hooks for operation execution.
	 * @returns A promise resolving to the updated Attachment.
	 */
	async replace(file: BlobBody, createAttachmentDto: CreateAttachmentDto & { _id: string }, hooks?: OperationHooks<OperationContext, Attachment>): Promise<Attachment> {
		return operations.replace(this.deps, { createAttachmentDto, file, hooks });
	}

	/**
	 * Uploads a new file and creates the corresponding attachment.
	 * @param file - Blob body of the file to upload.
	 * @param createAttachmentDto - Data transfer object for attachment creation. _id is optional.
	 * @param hooks - Hooks for operation execution.
	 * @returns A promise resolving to the created Attachment.
	 */
	async upload(file: BlobBody, createAttachmentDto: CreateAttachmentDto & { _id?: string }, hooks?: OperationHooks<OperationContext, Attachment>): Promise<Attachment> {
		return operations.upload(this.deps, { createAttachmentDto, file, hooks });
	}

	/**
	 * Validates whether a file upload can proceed, based on file size and name.
	 * @param createAttachmentDto - Contains file information to validate (name and size).
	 * @param hooks - Hooks for operation execution.
	 * @param options - Optional: Max allowed file size in bytes.
	 * @returns A promise resolving to the validation result.
	 */
	async validateUpload(createAttachmentDto: Pick<CreateAttachmentDto, 'name' | 'size'>, hooks?: OperationHooks<OperationContext, operations.ValidateUploadResult>, options?: { maxSizeBytes?: number }): Promise<operations.ValidateUploadResult> {
		return operations.validateUpload({
			createAttachmentDto,
			hooks,
			maxSizeBytes: options?.maxSizeBytes,
			observability: this.deps.observability,
		});
	}

	/**
	 * Finds multiple attachments matching the filter criteria.
	 * @param filter - Filter criteria to match attachments.
	 * @param options - Find options.
	 * @param hooks - Hooks for operation execution.
	 * @returns A promise resolving to an array of matching attachments.
	 */
	async findMany(filter?: Filter<Attachment>, options?: FindOptions, hooks?: OperationHooks<OperationContext, Attachment[]>): Promise<Attachment[] | null> {
		return operations.findMany(this.deps, { filter, hooks, options });
	}
}

/* * */

export const storageProvider = asyncSingletonProxy(StorageProviderClass);
