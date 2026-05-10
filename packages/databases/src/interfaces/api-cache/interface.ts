/* * */

import { GORedisClient } from '@/clients/go-redis.js';
import { type ApiCacheKey, ApiCacheKeyValues } from '@/interfaces/api-cache/keys.js';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { type RedisClientType } from 'redis';

/* * */

class ApiCacheClass {
	//

	private static _instance: null | Promise<ApiCacheClass> = null;

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
				const instance = new ApiCacheClass();
				// This behaves like the constructor,
				// but allows for async initialization.
				await instance.init();
				return instance;
			})();
		}
		// Await the instance if it's still initializing,
		// or return it immediately if ready.
		return await this._instance;
	}

	/**
	 * Deletes all keys from the cache that are not defined in `ApiCacheKeyValues`.
	 * This method is useful for maintaining a clean state free of stale
	 * or irrelevant cache entries that consume storage and memory resources.
	 * @returns A promise that resolves when the cleaning process is complete.
	 * @throws Will throw an error if the cleaning process fails.
	 */
	public async clean() {
		const allKeys = await this.client.keys('*');
		const keysToDelete = allKeys.filter(key => !ApiCacheKeyValues.includes(key as ApiCacheKey));
		if (keysToDelete.length) await this.client.del(keysToDelete);
	}

	/**
	 * Deletes a cache entry by its key.
	 * @param key The key of the cache entry to delete.
	 * @returns A promise that resolves when the deletion process is complete.
	 * @throws Will throw an error if the deletion process fails.
	 */
	public async delete(key: ApiCacheKey) {
		await this.client.del(key);
	}

	/**
	 * Retrieves a cache entry by its key.
	 * @param key The key of the cache entry to retrieve.
	 * @returns A promise that resolves with the cache entry value,
	 * or `null` if not found.
	 * @throws Will throw an error if the retrieval process fails.
	 */
	public async get(key: ApiCacheKey): Promise<null | string> {
		const result = await this.client.get(key);
		if (typeof result !== 'string') return null;
		return result;
	}

	/**
	 * Saves a cache entry with an optional time-to-live (TTL).
	 * @param key The key of the cache entry to save.
	 * @param value The value of the cache entry to save. Must be a string.
	 * @param ttl Optional time-to-live for the cache entry in seconds.
	 * If not provided, the entry will persist indefinitely.
	 */
	public async set(key: ApiCacheKey, value: string, ttl?: number) {
		// Validate value type before setting cache
		if (typeof value !== 'string') throw new Error(`[ApiCache] Value must be a string. Got "${typeof value}" for key "${key}".`);
		// Check if key is valid before setting cache
		if (!ApiCacheKeyValues.includes(key)) throw new Error(`[ApiCache] Invalid cache key "${key}". Allowed keys are: ${ApiCacheKeyValues.join(', ')}.`);
		// Set cache with optional TTL
		if (ttl) await this.client.set(key, value, { expiration: { type: 'EX', value: ttl } });
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

export const apiCache = asyncSingletonProxy(ApiCacheClass);
