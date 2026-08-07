/* * */

import { BlobBody } from '@/types/blob-body.js';
import { type StorageDeps } from '@/types/deps.js';
import { type OperationHooks } from '@/types/hooks.js';
import { type OperationContext } from '@/types/operation-context.js';
import { getMimeTypeFromFileExtension } from '@/utils/mime.js';
import { buildStorageKey } from '@/utils/storage-key.js';
import { withTransaction } from '@tmlmobilidade/go-clients-mongo';
import { StorageError, toStorageError } from '@tmlmobilidade/go-clients-oci-storage';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type Attachment, type CreateAttachmentDto } from '@tmlmobilidade/types';

/* * */

export interface UploadInput {
	createAttachmentDto: CreateAttachmentDto & { _id?: string }
	file: BlobBody
	hooks?: OperationHooks<OperationContext, Attachment>
}

/* * */

export async function upload(deps: StorageDeps, input: UploadInput): Promise<Attachment> {
	//

	const { createAttachmentDto, file, hooks } = input;
	const fileId = createAttachmentDto._id ?? generateRandomString({ length: 5 });
	const mimeType = getMimeTypeFromFileExtension(createAttachmentDto.name);
	const filePath = buildStorageKey(createAttachmentDto.scope, createAttachmentDto.resource_id, fileId, createAttachmentDto.name);
	const context: OperationContext = { attachmentId: fileId, key: filePath, operation: 'upload', resourceId: createAttachmentDto.resource_id, scope: createAttachmentDto.scope };

	const startedAt = Date.now();
	let blobUploaded = false;

	deps.observability.onOperationStart(context);
	await hooks?.onStart?.(context);

	try {
		deps.observability.onStep({ ...context, phase: 'execute', step: 'putBlob' });
		await deps.blobs.uploadFile(filePath, file, mimeType);
		blobUploaded = true;

		const inserted = await withTransaction(deps.mongoClient, async (session) => {
			deps.observability.onStep({ ...context, phase: 'execute', step: 'insertMetadata' });
			const attachment = await goDb.core.attachments.insertOne({
				...createAttachmentDto,
				_id: fileId,
				type: mimeType,
			}, { options: { session } });

			await hooks?.onSuccess?.(context, attachment, session);
			return attachment;
		});

		deps.observability.onOperationEnd({ ...context, durationMs: Date.now() - startedAt, outcome: 'success' });
		return inserted;
	} catch (error) {
		const storageError = toStorageError(error, { operation: context.operation });

		if (blobUploaded) {
			deps.observability.onStep({ ...context, phase: 'compensate', step: 'putBlob' });
			await deps.blobs.deleteFile(filePath).catch(() => {});
		}

		await hooks?.onRollback?.(context, storageError);
		await hooks?.onError?.(context, storageError);
		deps.observability.onOperationEnd({ ...context, durationMs: Date.now() - startedAt, outcome: 'error' });

		if (!(error instanceof StorageError)) throw error;
		throw storageError;
	} finally {
		await hooks?.onFinally?.(context);
	}
}
