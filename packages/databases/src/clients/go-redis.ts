/* * */

import { Logger } from '@tmlmobilidade/logger';
import { goSshTunnel, SshTunnel } from '@tmlmobilidade/ssh';
import { createClient, type RedisClientType } from 'redis';

/* * */

export class GORedisClient {
	//

	private static _instance: null | Promise<GORedisClient> = null;

	private client: RedisClientType;
	private tunnel: null | SshTunnel = null;

	/**
	 * Disallow direct instantiation of the service.
	 * Use getClient() instead to ensure singleton behavior.
	 */
	private constructor() {}

	/**
	 * Returns the singleton instance of the subclass.
	 */
	public static async getClient() {
		// If no instance exists, create one and store the promise.
		// This ensures that if multiple calls to getClient() happen concurrently,
		// they will all await the same initialization process.
		if (!this._instance) {
			this._instance = (async () => {
				const instance = new GORedisClient();
				// This behaves like the constructor,
				// but allows for async initialization.
				await instance.connect();
				return instance;
			})();
		}
		// Await the instance if it's still initializing,
		// or return it immediately if ready.
		const instance = await this._instance;
		return instance.client;
	}

	/**
	 * Connects to Redis, setting up the client instance.
	 * If SSH tunneling is required, it establishes the tunnel first.
	 * This method is called internally by the service and should not be used directly.
	 */
	private async connect() {
		Logger.info({ message: '[GORedisClient] Connecting to database...' });
		const connectionString = await this.getConnectionString();
		this.client = createClient({ url: connectionString });
		await this.client.connect();
		Logger.info({ message: '[GORedisClient] Connected to database' });
	}

	/**
	 * Constructs the connection string based on environment variables
	 * and SSH tunneling configuration, and handles both direct connections and SSH-tunneled
	 * connections, validating the necessary environment variables for each case.
	 * This method is called internally by the service and should not be used directly.
	 * @throws Will throw an error if required environment variables are missing or if the SSH tunnel setup fails.
	 * @returns A promise that resolves to the Redis connection string.
	 */
	private async getConnectionString(): Promise<string> {
		//

		//
		// Validate required environment variables

		if (!process.env.GO_REDIS_HOST || !process.env.GO_REDIS_PORT) {
			throw new Error('Missing GO_REDIS_HOST or GO_REDIS_PORT');
		}

		this.tunnel = goSshTunnel({ dstAddr: process.env.GO_REDIS_HOST, dstPort: Number(process.env.GO_REDIS_PORT) });

		if (!this.tunnel) {
			return `redis://${process.env.GO_REDIS_HOST}:${process.env.GO_REDIS_PORT}`;
		}

		Logger.info({ message: '[GORedisClient] Setting up SSH Tunnel...' });

		const connection = await this.tunnel.connect();
		const addr = connection.address();

		if (!addr || typeof addr !== 'object') {
			throw new Error('[GORedisClient] Failed to retrieve SSH tunnel address.');
		}

		return `redis://localhost:${addr.port}`;
	}

	//
}
