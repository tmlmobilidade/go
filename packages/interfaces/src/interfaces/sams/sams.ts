/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateSamDto, CreateSamSchema, type Sam, type UpdateSamDto, UpdateSamSchema } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class SamsClass extends MongoCollectionClass<Sam, CreateSamDto, UpdateSamDto> {
	private static _instance: SamsClass;

	protected override createSchema: z.ZodSchema = CreateSamSchema;
	protected override updateSchema: z.ZodSchema = UpdateSamSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!SamsClass._instance) {
			const instance = new SamsClass();
			await instance.connect();
			SamsClass._instance = instance;
		}
		return SamsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { created_at: 1 } },
			{ background: true, key: { agency_id: 1 } },
			{ background: true, key: { agency_id: 1, created_at: -1 } },
			{ background: true, key: { latest_apex_version: 1 } },
			{ background: true, key: { latest_apex_version: 1, created_at: -1 } },
			{ background: true, key: { mac_sam_serial_number: 1 } },
			{ background: true, key: { seen_first_at: 1 } },
			{ background: true, key: { seen_last_at: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'sams';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const sams = asyncSingletonProxy(SamsClass);
