/* * */

import { type OperationHooks } from '@/types/hooks.js';
import { type OperationContext } from '@/types/operation-context.js';
import { getFileExtension } from '@/utils/mime.js';
import { runSaga } from '@/utils/operation-runner.js';
import { storageKey } from '@/utils/storage-key.js';
import { MetadataError, NotFoundError } from '@tmlmobilidade/go-clients-oci-storage';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type Attachment, CreateAttachmentSchema } from '@tmlmobilidade/types';
import { convertObject } from '@tmlmobilidade/utils';

import { type StorageDeps } from '../types/deps.js';

/* * */

export interface CopyInput {
	fileId: string
	hooks?: OperationHooks<OperationContext, Attachment>
	resourceId: string
	scope: string
}

/* * */

export async function copy(deps: StorageDeps, input: CopyInput): Promise<Attachment> {
	//

	const { fileId, hooks, resourceId, scope } = input;
	const _id = generateRandomString({ length: 5 });
	const context: OperationContext = { attachmentId: _id, operation: 'copy', resourceId, scope, sourceAttachmentId: fileId };

	let source: Attachment | undefined;
	let originalFilePath = '';
	let newFilePath = '';
	let inserted: Attachment | undefined;

	return runSaga({
		context,
		hooks,
		observability: deps.observability,
		result: () => {
			if (!inserted) throw new MetadataError('Copy completed without inserted attachment');
			return inserted;
		},
		steps: [
			{
				execute: async () => {
					const found = await goDb.core.attachments.findOne({ _id: { $eq: fileId } });
					if (!found) throw new NotFoundError('File not found', { context: { fileId } });
					source = found;
					originalFilePath = storageKey(found);
					newFilePath = `${scope}/${resourceId}/${_id}.${getFileExtension(found.name)}`;
					context.key = newFilePath;
				},
				name: 'loadSource',
			},
			{
				compensate: async () => {
					await deps.blobs.deleteFile(newFilePath);
				},
				execute: async () => {
					await deps.blobs.copyFile(originalFilePath, newFilePath);
				},
				name: 'copyBlob',
			},
			{
				compensate: async () => {
					if (inserted) await goDb.core.attachments.deleteById(inserted._id, { forceIfLocked: true });
				},
				execute: async () => {
					if (!source) throw new MetadataError('Copy source missing during insert');
					const newFile = convertObject(source, CreateAttachmentSchema);
					inserted = await goDb.core.attachments.insertOne({
						...newFile,
						_id,
						resource_id: resourceId,
						scope,
					});
				},
				name: 'insertMetadata',
			},
		],
	});
}
