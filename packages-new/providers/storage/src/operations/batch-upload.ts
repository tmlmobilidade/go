/* * */

import { BlobBody } from '@/types/blob-body.js';
import { type OperationHooks } from '@/types/hooks.js';
import { type OperationContext } from '@/types/operation-context.js';
import { type StorageError, toStorageError } from '@/types/storage-error.js';
import { type Attachment, type CreateAttachmentDto } from '@tmlmobilidade/types';
import { runWithConcurrency } from '@tmlmobilidade/utils';

import { type StorageDeps } from '../types/deps.js';
import { upload } from './upload.js';

/* * */

export interface BatchUploadItem {
	createFileDto: CreateAttachmentDto & { _id?: string }
	file: BlobBody
}

export interface BatchResult<T> {
	fulfilled: { index: number, value: T }[]
	rejected: { error: StorageError, index: number }[]
}

export interface BatchUploadInput {
	concurrency?: number
	hooks: OperationHooks<OperationContext, BatchResult<Attachment>>
	items: BatchUploadItem[]
}

export async function batchUpload(deps: StorageDeps, input: BatchUploadInput): Promise<BatchResult<Attachment>> {
	//

	const { concurrency = 5, hooks, items } = input;
	const context: OperationContext = { itemCount: items.length, operation: 'batchUpload' };

	await hooks.onStart?.(context);

	try {
		const settlements = await runWithConcurrency(items, concurrency, async (item) => {
			return upload(deps, {
				createFileDto: item.createFileDto,
				file: item.file,
				hooks: {
					onError: async () => undefined,
					onSuccess: async () => undefined,
				},
			});
		});

		const fulfilled: BatchResult<Attachment>['fulfilled'] = [];
		const rejected: BatchResult<Attachment>['rejected'] = [];

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
