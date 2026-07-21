/* * */

import { type StorageDeps } from '@/types/deps.js';
import { type OperationHooks } from '@/types/hooks.js';
import { type OperationContext } from '@/types/operation-context.js';
import { NotFoundError, ValidationError } from '@/types/storage-error.js';
import { runOperation } from '@/utils/operation-runner.js';
import { storageKey } from '@/utils/storage-key.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/* * */

export interface GetSignedUrlInput {
	fileId?: string
	hooks: OperationHooks<OperationContext, string>
	key?: string
}

/* * */

export async function getSignedUrl(deps: StorageDeps, input: GetSignedUrlInput): Promise<string> {
	//

	const { fileId, hooks, key: keyInput } = input;
	const context: OperationContext = { attachmentId: fileId, key: keyInput, operation: 'getSignedUrl' };

	return runOperation({
		context,
		execute: async () => {
			if (!fileId && !keyInput) {
				throw new ValidationError('Either "fileId" or "key" must be provided');
			}

			let key = keyInput;
			if (fileId) {
				const file = await goDb.core.attachments.findOne({ _id: { $eq: fileId } });
				if (!file) throw new NotFoundError('File not found', { context: { fileId } });
				key = storageKey(file);
			}

			return deps.blobs.getUrl(key as string);
		},
		hooks,
		observability: deps.observability,
	});
}
