/**
 * NOTE: TRANSACTIONS ARE ONLY SUPPORTED BY REPLICA SETS
 *
 * Transaction numbers are only allowed on a replica set member or mongos
 *
 * @see https://www.mongodb.com/docs/manual/core/transactions-operations/
 */

import { type ClientSession, type MongoClient, type TransactionOptions } from 'mongodb';

/**
 * Manual MongoDB multi-document transaction wrapper.
 *
 * Prefer {@link withTransaction} unless you need explicit start/commit/abort control.
 */
export class Transaction {
	private session: ClientSession | undefined;

	constructor(private readonly client: MongoClient) {}

	async abort(): Promise<void> {
		if (!this.session) return;
		try {
			if (this.session.inTransaction()) {
				await this.session.abortTransaction();
			}
		} finally {
			await this.session.endSession();
			this.session = undefined;
		}
	}

	async commit(): Promise<void> {
		if (!this.session) throw new Error('Transaction has not been started');
		try {
			await this.session.commitTransaction();
		} finally {
			await this.session.endSession();
			this.session = undefined;
		}
	}

	getSession(): ClientSession {
		if (!this.session) throw new Error('Transaction has not been started');
		return this.session;
	}

	start(): void {
		if (this.session) throw new Error('Transaction already started');
		this.session = this.client.startSession();
		this.session.startTransaction();
	}
}

/**
 * Run `callback` inside a single multi-document transaction on `client`.
 *
 * Commits on success, aborts on error (with driver retry for transient errors).
 * Pass the same `session` into every operation that must participate.
 *
 * @example
 * ```ts
 * const client = await MongoDatabaseClient.getClient({ prefix: 'GODB' })
 * await withTransaction(client, async (session) => {
 *   await files.insertOne(doc, { options: { session } })
 *   await plans.updateById(id, patch, { session })
 * })
 * ```
 */
export async function withTransaction<R>(
	client: MongoClient,
	callback: (session: ClientSession) => Promise<R>,
	options?: TransactionOptions,
): Promise<R> {
	const session = client.startSession();
	try {
		let result!: R;
		await session.withTransaction(async () => {
			result = await callback(session);
		}, options);
		return result;
	} finally {
		await session.endSession();
	}
}
