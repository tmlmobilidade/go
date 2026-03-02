// /* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { CreateProposedChangeDto, ProposedChange, ProposedChangeSchema, UpdateProposedChangeDto, UpdateProposedChangeSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class ProposedChangesClass extends MongoCollectionClass<ProposedChange<any>, CreateProposedChangeDto<any>, UpdateProposedChangeDto<any>> {
	private static _instances = new Map<string, ProposedChangesClass>();
	protected override createSchema: z.ZodSchema = ProposedChangeSchema;
	protected override updateSchema: z.ZodSchema = UpdateProposedChangeSchema;

	private constructor() {
		super();
	}

	public static async getInstance(typeName?: string): Promise<ProposedChangesClass> {
		const key = typeName ?? 'default';

		if (!this._instances.has(key)) {
			const instance = new ProposedChangesClass();
			await instance.connect();
			this._instances.set(key, instance);
		}

		return this._instances.get(key) as ProposedChangesClass;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [{ background: true, key: { name: 1 } }];
	}

	protected getCollectionName(): string {
		return 'proposed_changes';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}
/* * */

export const proposedChanges = asyncSingletonProxy(ProposedChangesClass);
