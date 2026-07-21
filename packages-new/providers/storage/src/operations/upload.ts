/* * */

import { BlobBody } from '@/types/blob-body.js';
import { type StorageDeps } from '@/types/deps.js';
import { type OperationHooks } from '@/types/hooks.js';
import { type OperationContext } from '@/types/operation-context.js';
import { getMimeTypeFromFileExtension } from '@/utils/mime.js';
import { runSaga } from '@/utils/operation-runner.js';
import { buildStorageKey } from '@/utils/storage-key.js';
import { MetadataError } from '@tmlmobilidade/go-clients-oci-storage';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type Attachment, type CreateAttachmentDto } from '@tmlmobilidade/types';

/* * */

export interface UploadInput {
	createFileDto: CreateAttachmentDto & { _id?: string }
	file: BlobBody
	hooks: OperationHooks<OperationContext, Attachment>
}

/* * */

export async function upload(deps: StorageDeps, input: UploadInput): Promise<Attachment> {
	//

	const { createFileDto, file, hooks } = input;
	const fileId = createFileDto._id || generateRandomString({ length: 5 });
	const mimeType = getMimeTypeFromFileExtension(createFileDto.name);
	const filePath = buildStorageKey(createFileDto.scope, createFileDto.resource_id, fileId, createFileDto.name);
	const context: OperationContext = { attachmentId: fileId, key: filePath, operation: 'upload', resourceId: createFileDto.resource_id, scope: createFileDto.scope };

	let inserted: Attachment | undefined;

	return runSaga({
		context,
		hooks,
		observability: deps.observability,
		result: () => {
			if (!inserted) throw new MetadataError('Upload completed without inserted attachment');
			return inserted;
		},
		steps: [
			{
				compensate: async () => {
					await deps.blobs.deleteFile(filePath);
				},
				execute: async () => {
					await deps.blobs.uploadFile(filePath, file, mimeType);
				},
				name: 'putBlob',
			},
			{
				compensate: async () => {
					if (inserted) await goDb.core.attachments.deleteById(inserted._id, { forceIfLocked: true });
				},
				execute: async () => {
					inserted = await goDb.core.attachments.insertOne({
						...createFileDto,
						_id: fileId,
						type: mimeType,
					});
				},
				name: 'insertMetadata',
			},
		],
	});
}
