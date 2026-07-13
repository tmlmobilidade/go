import { Logger } from '@tmlmobilidade/logger-backend';
import { goSshTunnel, SshTunnel } from '@tmlmobilidade/ssh';
import { createClient, type RedisClientOptions, type RedisClientType } from 'redis';

/**
 * Configuration for a Redis database client.
 *
 * Every database follows the same env var naming convention, scoped by `prefix`:
 *   `{PREFIX}_HOST` / `{PREFIX}_PORT` — connection endpoint
 *
 * @example
 * ```ts
 * const client = await RedisDatabaseClient.getClient({ prefix: 'GO_REDIS' })
 * ```
 */
export interface RedisDatabaseConfig {
	/** Optional overrides for the Redis client constructor options. */
	clientOptions?: Partial<RedisClientOptions>
	/** Env var prefix (e.g. `"GO_REDIS"`). */
	prefix: string
}

/**
 * Internal bookkeeping for an active database connection.
 */
interface RedisDatabaseEntry {
	client: RedisClientType
	tunnel: null | SshTunnel
}

/**
 * Singleton-per-prefix factory for connected Redis client instances.
 *
 * Each `prefix` maps to one Redis client, created once and cached. Env vars
 * are resolved at creation time using the prefix.
 *
 * @example
 * ```ts
 * const client = await RedisDatabaseClient.getClient({ prefix: 'GO_REDIS' })
 * ```
 */
export class RedisDatabaseClient {
	private static entries = new Map<string, Promise<RedisDatabaseEntry>>();

	/**
	 * Gracefully tear down all active database connections and SSH tunnels.
	 * Clears the internal cache so subsequent `getClient` calls re-connect.
	 */
	static async disconnectAll(): Promise<void> {
		const settlements = await Promise.allSettled(this.entries.values());
		for (const settlement of settlements) {
			if (settlement.status === 'fulfilled') {
				const entry = settlement.value;
				if (entry.tunnel) {
					await entry.tunnel.disconnect().catch(() => {});
				}
				await entry.client.disconnect().catch(() => {});
			}
		}
		this.entries.clear();
	}

	/**
	 * Get (or create) a connected Redis client for the given database config.
	 *
	 * Each unique `prefix` produces a singleton client. The first call
	 * validates env vars, optionally establishes an SSH tunnel, creates the
	 * Redis client, and connects. Subsequent calls return the cached client
	 * immediately.
	 *
	 * @param config - Database configuration (env var prefix + optional overrides).
	 * @returns A connected Redis client instance.
	 */
	static async getClient(config: RedisDatabaseConfig): Promise<RedisClientType> {
		const key = config.prefix;

		if (!this.entries.has(key)) {
			const promise = this.createClient(config).catch((error) => {
				this.entries.delete(key);
				throw error;
			});
			this.entries.set(key, promise);
		}

		const entry = await this.entries.get(key)!;
		return entry.client;
	}

	/**
	 * Create a new RedisDatabaseEntry by resolving env vars, setting up the
	 * Redis client, and connecting.
	 */
	private static async createClient(config: RedisDatabaseConfig): Promise<RedisDatabaseEntry> {
		const { clientOptions, prefix } = config;

		Logger.info({ message: `[${prefix}] Connecting to database...` });

		const { tunnel, uri } = await this.getConnectionString(config);

		const client = createClient({ url: uri, ...clientOptions });
		await client.connect();

		Logger.info({ message: `[${prefix}] Connected to database.` });

		return { client, tunnel };
	}

	/**
	 * Build a Redis connection string from env vars.
	 *
	 * Two modes:
	 *   - **Direct** (`TUNNEL_ENABLED=false`): host/port URI.
	 *   - **SSH tunnel** (`TUNNEL_ENABLED=true`): creates an `SshTunnelService`,
	 *     connects, and returns a `localhost` URI pointing at the tunnel endpoint.
	 *
	 * Validates that all required vars for the chosen mode are set.
	 *
	 * @returns The resolved URI and an optional SSH tunnel reference.
	 */
	private static async getConnectionString(config: RedisDatabaseConfig): Promise<{ tunnel: null | SshTunnel, uri: string }> {
		//

		const { prefix } = config;
		const env = (name: string) => process.env[`${prefix}_${name}`];

		// Check if the required Redis environment variables are set.
		if (!env('HOST') || !env('PORT')) throw new Error(`Missing ${prefix}_HOST or ${prefix}_PORT`);

		// Create an SSH tunnel if the required environment variables are set.
		const tunnel = goSshTunnel({ dstAddr: env('HOST')!, dstPort: Number(env('PORT')) });

		if (!tunnel) {
			return {
				tunnel: null,
				uri: `redis://${env('HOST')}:${env('PORT')}`,
			};
		}

		Logger.info({ message: `[${prefix}] Setting up SSH Tunnel...` });

		const connection = await tunnel.connect();
		const addr = connection.address();

		if (!addr || typeof addr !== 'object') {
			throw new Error(`[${prefix}] Failed to retrieve SSH tunnel address.`);
		}

		return {
			tunnel,
			uri: `redis://localhost:${addr.port}`,
		};
	}
}
