/* * */

import { BlobBody } from '@/types/blob-body.js';
import { type StorageDeps } from '@/types/deps.js';
import { type OperationHooks } from '@/types/hooks.js';
import { type OperationContext } from '@/types/operation-context.js';
import { getMimeTypeFromFileExtension } from '@/utils/mime.js';
import { runSaga } from '@/utils/operation-runner.js';
import { buildStorageKey, storageKey, tempStorageKey } from '@/utils/storage-key.js';
import { ConflictError, MetadataError, NotFoundError } from '@tmlmobilidade/go-clients-oci-storage';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Attachment, type CreateAttachmentDto, CreateAttachmentSchema } from '@tmlmobilidade/types';
import { convertObject } from '@tmlmobilidade/utils';

/**
 * Replace an existing attachment in place (same id / path).
 * Uses copy-aside of the old blob so a failed put can restore the previous object.
 */
export interface ReplaceInput {
	createFileDto: CreateAttachmentDto & { _id: string }
	file: BlobBody
	hooks: OperationHooks<OperationContext, Attachment>
}

export async function replace(deps: StorageDeps, input: ReplaceInput): Promise<Attachment> {
	//

	const { createFileDto, file, hooks } = input;
	const fileId = createFileDto._id;
	const mimeType = getMimeTypeFromFileExtension(createFileDto.name);
	const filePath = buildStorageKey(createFileDto.scope, createFileDto.resource_id, fileId, createFileDto.name);
	const context: OperationContext = { attachmentId: fileId, key: filePath, operation: 'replace', resourceId: createFileDto.resource_id, scope: createFileDto.scope };

	let existing: Attachment | undefined;
	let asideKey = '';
	let inserted: Attachment | undefined;
	let asideCreated = false;
	let newBlobWritten = false;

	return runSaga({
		context,
		hooks,
		observability: deps.observability,
		result: () => {
			if (!inserted) throw new MetadataError('Replace completed without inserted attachment');
			return inserted;
		},
		steps: [
			{
				execute: async () => {
					const found = await goDb.core.attachments.findOne({ _id: { $eq: fileId } });
					if (!found) throw new NotFoundError('File not found', { context: { fileId } });
					existing = found;
					const existingPath = storageKey(found);
					if (existingPath !== filePath) {
						throw new ConflictError('File ID is provided, but the file path is different from the existing file', {
							context: { existingPath, filePath },
						});
					}
					asideKey = tempStorageKey(existingPath);
				},
				name: 'loadAndValidate',
			},
			{
				compensate: async () => {
					if (asideCreated) await deps.blobs.deleteFile(asideKey);
				},
				execute: async () => {
					await deps.blobs.copyFile(filePath, asideKey);
					asideCreated = true;
				},
				name: 'copyAside',
			},
			{
				compensate: async () => {
					if (newBlobWritten) {
						await deps.blobs.copyFile(asideKey, filePath);
					}
				},
				execute: async () => {
					await deps.blobs.uploadFile(filePath, file, mimeType);
					newBlobWritten = true;
				},
				name: 'putBlob',
			},
			{
				compensate: async () => {
					if (inserted && existing) {
						await goDb.core.attachments.deleteById(fileId, { forceIfLocked: true });
						const restored = convertObject(existing, CreateAttachmentSchema);
						await goDb.core.attachments.insertOne({ ...restored, _id: fileId });
					}
				},
				execute: async () => {
					await goDb.core.attachments.deleteById(fileId, { forceIfLocked: true });
					inserted = await goDb.core.attachments.insertOne({
						...createFileDto,
						_id: fileId,
						type: mimeType,
					});
				},
				name: 'replaceMetadata',
			},
			{
				execute: async () => {
					if (asideCreated) {
						await deps.blobs.deleteFile(asideKey);
						asideCreated = false;
					}
				},
				name: 'cleanupAside',
			},
		],
	});
}
