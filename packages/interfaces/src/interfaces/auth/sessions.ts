/* * */

import { MongoCollectionClass } from '@/mongo-collection.js';
import { CreateSessionDto, Session, SessionSchema, UpdateSessionDto } from '@tmlmobilidade/go-types';
import { AsyncSingletonProxy } from '@tmlmobilidade/go-utils';
import { IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class SessionsClass extends MongoCollectionClass<Session, CreateSessionDto, UpdateSessionDto> {
	private static _instance: SessionsClass;
	protected override createSchema: z.ZodSchema = SessionSchema;
	protected override updateSchema: z.ZodSchema = SessionSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!SessionsClass._instance) {
			const instance = new SessionsClass();
			await instance.connect();
			SessionsClass._instance = instance;
		}
		return SessionsClass._instance;
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { user_id: 1 } },
			{ background: true, key: { expires: 1 } },
			{ background: true, key: { token: 1 }, unique: true },
		];
	}

	protected getCollectionName(): string {
		return 'sessions';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

export const sessions = AsyncSingletonProxy(SessionsClass);
