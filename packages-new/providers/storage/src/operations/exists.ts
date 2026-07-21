/* * */

import { type OperationHooks } from '@/types/hooks.js';
import { type OperationContext } from '@/types/operation-context.js';
import { ValidationError } from '@/types/storage-error.js';
import { runOperation } from '@/utils/operation-runner.js';
import { storageKey } from '@/utils/storage-key.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

import { type StorageDeps } from '../types/deps.js';

/* * */

export interface ExistsResult {
	blob: boolean
	metadata: boolean
}

export interface ExistsInput {
	fileId?: string
	hooks: OperationHooks<OperationContext, ExistsResult>
	key?: string
}

/* * */

export async function exists(deps: StorageDeps, input: ExistsInput): Promise<ExistsResult> {
	//

	const { fileId, hooks, key: keyInput } = input;
	const context: OperationContext = { attachmentId: fileId, key: keyInput, operation: 'exists' };

	return runOperation({
		context,
		execute: async () => {
			if (!fileId && !keyInput) {
				throw new ValidationError('Either "fileId" or "key" must be provided');
			}

			if (fileId) {
				const file = await goDb.core.attachments.findById(fileId);
				if (!file) return { blob: false, metadata: false };
				const blob = await deps.blobs.exists(storageKey(file));
				return { blob, metadata: true };
			}

			const blob = await deps.blobs.exists(keyInput as string);
			return { blob, metadata: false };
		},
		hooks,
		observability: deps.observability,
	});
}
