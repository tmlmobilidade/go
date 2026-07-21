/* * */

import { type OperationHooks } from '@/types/hooks.js';
import { type OperationContext } from '@/types/operation-context.js';
import { NotFoundError } from '@/types/storage-error.js';
import { runSaga } from '@/utils/operation-runner.js';
import { storageKey } from '@/utils/storage-key.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

import { type StorageDeps } from '../types/deps.js';

/**
 * Deletes blob then metadata.
 * Invariant: prefer an orphan blob over dangling metadata pointing at a missing blob.
 * If metadata delete fails after blob delete, there is no blob restore compensation.
 */
export interface DeleteInput {
	fileId: string
	hooks: OperationHooks<OperationContext, { fileId: string }>
}

export async function deleteAttachment(deps: StorageDeps, input: DeleteInput): Promise<{ fileId: string }> {
	//

	const { fileId, hooks } = input;
	const context: OperationContext = { attachmentId: fileId, operation: 'delete' };

	let key = '';

	return runSaga({
		context,
		hooks,
		observability: deps.observability,
		result: () => ({ fileId }),
		steps: [
			{
				execute: async () => {
					const attachment = await goDb.core.attachments.findById(fileId);
					if (!attachment) throw new NotFoundError('File not found', { context: { fileId } });
					key = storageKey(attachment);
					context.key = key;
					context.resourceId = attachment.resource_id;
					context.scope = attachment.scope;
				},
				name: 'loadSource',
			},
			{
				execute: async () => {
					await deps.blobs.delete(key);
				},
				name: 'deleteBlob',
			},
			{
				execute: async () => {
					await goDb.core.attachments.deleteById(fileId, { forceIfLocked: true });
				},
				name: 'deleteMetadata',
			},
		],
	});
}
