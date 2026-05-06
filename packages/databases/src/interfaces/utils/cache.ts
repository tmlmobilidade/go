/* * */

import { GORedisClient } from '@/clients/go-redis.js';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type RedisClientType } from 'redis';

/* * */

class CacheClass {
	//

	private static _instance: null | Promise<CacheClass> = null;

	private client: RedisClientType;

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getInstance() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getInstance() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new CacheClass();
				// This behaves like the constructor,
				// but allows for async initialization.
				await instance.connectToClient();
				return instance;
			})();
		}
		// Await the instance if it's still initializing,
		// or return it immediately if ready.
		return await this._instance;
	}

	public async delete(key: string) {
		await this.client.del(key);
	}

	public async get(key: string) {
		return await this.client.get(key);
	}

	public async save(key: string, value: string, ttl?: number) {
		if (ttl) await this.client.set(key, value, { EX: ttl });
		else await this.client.set(key, value);
	}

	protected connectToClient() {
		return GORedisClient.getClient();
	}

	/**
	 * Initializes the Redis client.
	 * @throws Will throw an error if the client initialization fails.
	 * @returns A promise that resolves when the initialization process is complete.
	 */
	protected async init() {
		// Skip if already initialized
		if (this.client) return;
		// Connect to the Redis client
		this.client = await this.connectToClient();
	}

	//
}

/* * */

export const cache = asyncSingletonProxy(CacheClass);
