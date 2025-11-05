/* eslint-disable @typescript-eslint/no-explicit-any */
/* * */

import { MongoCollectionClass } from '@/mongo-collection.js';
import { CreateFileExportDto, FileExport, FileExportSchema, UpdateFileExportSchema } from '@tmlmobilidade/types';
import { AsyncSingletonProxy } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class FileExportsClass extends MongoCollectionClass<FileExport, CreateFileExportDto<any>, Partial<FileExport>> {
	//

	//
	//
	private static _instance: FileExportsClass;

	protected override createSchema: z.ZodSchema = FileExportSchema;
	protected override updateSchema: z.ZodSchema = UpdateFileExportSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!FileExportsClass._instance) {
			const instance = new FileExportsClass();
			await instance.connect();
			FileExportsClass._instance = instance;
		}
		return FileExportsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { file_name: 1 } },
			{ background: true, key: { processing_status: 1 } },
			{ background: true, key: { scope: 1 } },
			{ background: true, key: { type: 1 } },
			{ background: true, expireAfterSeconds: 60_000 * 4 * 60, key: { created_at: 1 } }, // 4 hours
			{ background: true, key: { updated_at: 1 } },
		];
	}

	protected getCollectionName(): string {
		return 'file_exports';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

/* * */

export const fileExports = AsyncSingletonProxy(FileExportsClass);
