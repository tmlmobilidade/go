/* * */

import { MongoCollectionClass } from '@/mongo-collection.js';
import { CreateVerificationTokenDto, UpdateVerificationTokenDto, VerificationToken, VerificationTokenSchema } from '@tmlmobilidade/types';
import { AsyncSingletonProxy } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class VerificationTokensClass extends MongoCollectionClass<VerificationToken, CreateVerificationTokenDto, UpdateVerificationTokenDto> {
	private static _instance: VerificationTokensClass;
	protected override createSchema: z.ZodSchema = VerificationTokenSchema;
	protected override updateSchema: z.ZodSchema = VerificationTokenSchema;

	private constructor() {
		super();
	}

	public static async getInstance() {
		if (!VerificationTokensClass._instance) {
			const instance = new VerificationTokensClass();
			await instance.connect();
			VerificationTokensClass._instance = instance;
		}
		return VerificationTokensClass._instance;
	}

	/**
	 * Finds a verification token by its token.
	 *
	 * @param token - The token to find
	 * @returns The verification token or null if not found
	 */
	async findByToken(token: string) {
		return this.findOne({ token });
	}

	protected getCollectionIndexes(): IndexDescription[] {
		return [
			{ background: true, key: { expires_at: 1 } },
			{ background: true, key: { token: 1 }, unique: true },
		];
	}

	protected getCollectionName(): string {
		return 'verification_tokens';
	}

	protected getEnvName(): string {
		return 'DATABASE_URI';
	}
}

export const verificationTokens = AsyncSingletonProxy(VerificationTokensClass);
