/* * */

import type { StorageDeps } from '@/types/deps.js';
import type { OperationHooks } from '@/types/hooks.js';
import type { OperationContext } from '@/types/operation-context.js';
import type { ClientSession, Filter } from '@tmlmobilidade/go-clients-mongo';

import { runOperation } from '@/utils/operation-runner.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Attachment } from '@tmlmobilidade/go-types-core';

/* * */

interface FindManyInput {
	clientSession?: ClientSession
	filter?: Filter<Attachment>
	hooks?: OperationHooks<OperationContext, Attachment[]>
}

export async function findMany(deps: StorageDeps, input: FindManyInput): ReturnType<typeof goDb.core.attachments.findMany> {
	//

	const { clientSession, filter, hooks } = input;
	const context: OperationContext = { operation: 'findMany' };

	return runOperation({
		context,
		execute: async () => {
			return await goDb.core.attachments.findMany(filter, { session: clientSession });
		},
		hooks,
		observability: deps.observability,
	});
}
