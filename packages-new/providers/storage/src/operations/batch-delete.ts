/* * */

import { type OperationHooks } from '@/types/hooks.js';
import { type OperationContext } from '@/types/operation-context.js';
import { type StorageError, toStorageError } from '@tmlmobilidade/go-clients-oci-storage';
import { runWithConcurrency } from '@tmlmobilidade/utils';

import { type StorageDeps } from '../types/deps.js';
import { type BatchResult } from './batch-upload.js';
import { deleteAttachment } from './delete.js';

/* * */

export interface BatchDeleteInput {
	concurrency?: number
	fileIds: string[]
	hooks: OperationHooks<OperationContext, BatchResult<{ fileId: string }>>
}

/* * */

export async function batchDelete(deps: StorageDeps, input: BatchDeleteInput): Promise<BatchResult<{ fileId: string }>> {
	//

	const { concurrency = 5, fileIds, hooks } = input;
	const context: OperationContext = { itemCount: fileIds.length, operation: 'batchDelete' };

	await hooks.onStart?.(context);

	try {
		const settlements = await runWithConcurrency(fileIds, concurrency, async (fileId) => {
			return deleteAttachment(deps, {
				fileId,
				hooks: {
					onError: async () => undefined,
					onSuccess: async () => undefined,
				},
			});
		});

		const fulfilled: BatchResult<{ fileId: string }>['fulfilled'] = [];
		const rejected: BatchResult<{ fileId: string }>['rejected'] = [];

		settlements.forEach((settlement, index) => {
			if (settlement.status === 'fulfilled') {
				fulfilled.push({ index, value: settlement.value });
			} else {
				rejected.push({ error: settlement.reason as StorageError, index });
			}
		});

		const result = { fulfilled, rejected };
		await hooks.onSuccess(context, result);

		return result;
	} catch (error) {
		//

		const storageError = toStorageError(error, { operation: context.operation });
		await hooks.onError(context, storageError);

		throw storageError;
	} finally {
		//

		await hooks.onFinally?.(context);
	}
}
