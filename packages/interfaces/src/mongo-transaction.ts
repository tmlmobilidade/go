/**
 * NOTE: TRANSACTIONS ARE ONLY SUPPORTED BY REPLICA SETS
 *
 * Transaction numbers are only allowed on a replica set member or mongos
 *
 * @see https://www.mongodb.com/docs/manual/core/transactions-operations/
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoConnector } from '@go/connectors-mongo';
import { ClientSession } from 'mongodb';

import { MongoCollectionClass } from './mongo-collection.js';

export class Transaction {
	private session: ClientSession;

	constructor(private mongoConnector: MongoConnector) {}

	async abort() {
		await this.session.abortTransaction();
		await this.session.endSession();
	}

	async commit() {
		await this.session.commitTransaction();
		await this.session.endSession();
	}

	getSession() {
		return this.session;
	}

	async start() {
		this.session = (await this.mongoConnector).client.startSession();
		this.session.startTransaction();
	}
}

export class TransactionManager<T extends readonly MongoCollectionClass<any, any, any>[]> {
	private transactions = new Map<MongoCollectionClass<any, any, any>, Transaction>();

	constructor(private collections: T) {}

	async withTransaction<R>(
		callback: (
			collections: T,
			transactions: Map<MongoCollectionClass<any, any, any>, Transaction>
		) => Promise<R>,
	): Promise<R> {
		try {
			// Start transactions for each collection
			for (const collection of this.collections) {
				const transaction = new Transaction(collection.getMongoConnector());
				await transaction.start();
				this.transactions.set(collection, transaction);
			}

			// Execute callback with collections and transaction map
			const result = await callback(this.collections, this.transactions);

			// If successful, commit all transactions
			await Promise.all(
				Array.from(this.transactions.values()).map(transaction => transaction.commit()),
			);

			return result;
		}
		catch (error) {
			// If any error occurs, abort all transactions
			for (const transaction of this.transactions.values()) {
				await transaction.abort();
			}
			throw error;
		}
		finally {
			this.transactions.clear();
		}
	}
}
