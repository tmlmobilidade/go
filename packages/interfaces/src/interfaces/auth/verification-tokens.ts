/* * */

import { MongoCollectionClass } from '@/common/mongo-collection.js';
import { type CreateVerificationTokenDto, CreateVerificationTokenSchema, type UpdateVerificationTokenDto, UpdateVerificationTokenSchema, type VerificationToken } from '@tmlmobilidade/types';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { IndexDescription } from 'mongodb';
import { z } from 'zod';

/* * */

class VerificationTokensClass extends MongoCollectionClass<VerificationToken, CreateVerificationTokenDto, UpdateVerificationTokenDto> {
	private static _instance: VerificationTokensClass;
	protected override createSchema: z.ZodSchema = CreateVerificationTokenSchema;
	protected override updateSchema: z.ZodSchema = UpdateVerificationTokenSchema;

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
	 * @param token The token to find.
	 * @returns The verification token or null if not found.
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

/* * */

export const verificationTokens = asyncSingletonProxy(VerificationTokensClass);
