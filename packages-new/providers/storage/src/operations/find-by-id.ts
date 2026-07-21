/* * */

import { type StorageDeps } from '@/types/deps.js';
import { type OperationHooks } from '@/types/hooks.js';
import { type OperationContext } from '@/types/operation-context.js';
import { runOperation } from '@/utils/operation-runner.js';
import { storageKey } from '@/utils/storage-key.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Attachment } from '@tmlmobilidade/types';

/* * */

export interface FindByIdInput {
	hooks: OperationHooks<OperationContext, Attachment | null>
	id: string
}

/* * */

export async function findById(deps: StorageDeps, input: FindByIdInput): Promise<Attachment | null> {
	//

	const { hooks, id } = input;
	const context: OperationContext = { attachmentId: id, operation: 'findById' };

	return runOperation({
		context,
		execute: async () => {
			const file = await goDb.core.attachments.findById(id);
			if (!file) return null;

			file.url = await deps.blobs.getFileUrl(storageKey(file));
			return file;
		},
		hooks,
		observability: deps.observability,
	});
}
