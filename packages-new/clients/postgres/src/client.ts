/* * */

import { createSshTunnelFactory, SshTunnel, SshTunnelType } from '@tmlmobilidade/go-clients-ssh';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { Pool, type PoolConfig } from 'pg';

/* * */

/**
 * Configuration for a PostgreSQL / PostGIS database client.
 *
 * Every database follows the same env var naming convention, scoped by `prefix`:
 *   `{PREFIX}_HOST` / `{PREFIX}_PORT` — connection endpoint
 *   `{PREFIX}_USERNAME` / `{PREFIX}_PASSWORD` — credentials
 *   `{PREFIX}_DATABASE` — database name
 *
 * @example
 * ```ts
 * const client = await PostgresDatabaseClient.getClient({ prefix: 'LOCATIONSDB' })
 * ```
 */
export interface PostgresDatabaseConfig {
	/** Optional overrides for the Pool constructor options. */
	clientOptions?: Partial<PoolConfig>
	/** Env var prefix (e.g. `"LOCATIONSDB"`). */
	prefix: string
	/** Type of SSH tunnel to use. */
	tunnelType?: SshTunnelType
}

/**
 * Internal bookkeeping for an active database connection.
 */
interface PostgresDatabaseEntry {
	client: Pool
	tunnel: null | SshTunnel
}

/**
 * Singleton-per-prefix factory for connected PostgreSQL pool instances.
 *
 * Each `prefix` maps to one pool, created once and cached. Env vars are
 * resolved at creation time using the prefix. Works with plain Postgres and
 * PostGIS-enabled databases.
 *
 * @example
 * ```ts
 * const client = await PostgresDatabaseClient.getClient({ prefix: 'LOCATIONSDB' })
 * ```
 */
export class PostgresDatabaseClient {
	private static entries = new Map<string, Promise<PostgresDatabaseEntry>>();

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
				await entry.client.end().catch(() => {});
			}
		}
		this.entries.clear();
	}

	/**
	 * Get (or create) a connected PostgreSQL pool for the given database config.
	 *
	 * Each unique `prefix` produces a singleton pool. The first call validates
	 * env vars, optionally establishes an SSH tunnel, creates the pool, and
	 * verifies connectivity. Subsequent calls return the cached pool immediately.
	 *
	 * @param config - Database configuration (env var prefix + optional overrides).
	 * @returns A connected PostgreSQL pool instance.
	 */
	static async getClient(config: PostgresDatabaseConfig): Promise<Pool> {
		const key = config.prefix;

		if (!this.entries.has(key)) {
			const promise = this.createClient(config).catch((error) => {
				this.entries.delete(key);
				throw error;
			});
			this.entries.set(key, promise);
		}

		const entry = await this.entries.get(key);
		if (!entry) throw new Error(`[${key}] Client not found.`);
		return entry.client;
	}

	/**
	 * Create a new PostgresDatabaseEntry by resolving env vars, setting up the
	 * pool, and verifying connectivity.
	 */
	private static async createClient(config: PostgresDatabaseConfig): Promise<PostgresDatabaseEntry> {
		const { clientOptions, prefix } = config;

		Logger.info({ message: `[${prefix}] Connecting to database...` });

		const { tunnel, uri } = await this.getConnectionString(config);

		const client = new Pool({
			connectionString: uri,
			connectionTimeoutMillis: 10_000,
			max: 20,
			...clientOptions,
		});

		try {
			const connection = await client.connect();
			connection.release();
		} catch (error) {
			await client.end().catch(() => {});
			throw error;
		}

		Logger.info({ message: `[${prefix}] Connected to database.` });

		return { client, tunnel };
	}

	/**
	 * Build a PostgreSQL connection string from env vars.
	 *
	 * Two modes:
	 *   - **Direct** (no tunnel): `postgresql://user:password@host:port/database`.
	 *   - **SSH tunnel**: creates an `SshTunnel`, connects, and returns a
	 *     `localhost` URI pointing at the tunnel endpoint.
	 *
	 * Validates that all required vars for the chosen mode are set.
	 *
	 * @returns The resolved URI and an optional SSH tunnel reference.
	 */
	private static async getConnectionString(config: PostgresDatabaseConfig): Promise<{ tunnel: null | SshTunnel, uri: string }> {
		const { prefix } = config;
		const env = (name: string) => process.env[`${prefix}_${name}`];

		const host = env('HOST');
		const port = env('PORT');
		const username = env('USERNAME');
		const password = env('PASSWORD');
		const database = env('DATABASE');

		if (!host || !port) throw new Error(`Missing ${prefix}_HOST or ${prefix}_PORT`);
		if (!username || !password) throw new Error(`Missing ${prefix}_USERNAME or ${prefix}_PASSWORD`);
		if (!database) throw new Error(`Missing ${prefix}_DATABASE`);

		const tunnel = config.tunnelType ? createSshTunnelFactory(config.tunnelType)({ dstAddr: host, dstPort: Number(port) }) : null;

		const encodedUser = encodeURIComponent(username);
		const encodedPassword = encodeURIComponent(password);

		if (!tunnel) {
			return {
				tunnel: null,
				uri: `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${database}`,
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
			uri: `postgresql://${encodedUser}:${encodedPassword}@localhost:${addr.port}/${database}`,
		};
	}
}
