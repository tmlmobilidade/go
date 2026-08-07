import { Logger } from '@tmlmobilidade/logger';
import { createSshTunnelFactory, SshTunnel, SshTunnelType } from '@tmlmobilidade/ssh';
import { MongoClient, type MongoClientOptions } from 'mongodb';

/**
 * Configuration for a Mongo database client.
 *
 * Every database follows the same env var naming convention, scoped by `prefix`:
 *   `{PREFIX}_HOST_1` / `{PREFIX}_PORT_1` — replica set seed 1
 *   `{PREFIX}_HOST_2` / `{PREFIX}_PORT_2` — replica set seed 2
 *   `{PREFIX}_HOST_3` / `{PREFIX}_PORT_3` — replica set seed 3
 *   `{PREFIX}_USER` / `{PREFIX}_PASSWORD` — credentials
 *   `{PREFIX}_RS_NAME` — replica set name
 *
 * @example
 * ```ts
 * const client = await MongoDatabaseClient.getClient({ prefix: 'PCGI_RAW' })
 * ```
 */
export interface MongoDatabaseConfig {
	/** Optional overrides for the MongoClient constructor options. */
	clientOptions?: Partial<MongoClientOptions>
	/** Env var prefix (e.g. `"PCGI_RAW"`, `"GO_MONGO"`). */
	prefix: string
	/** Type of SSH tunnel to use. */
	tunnelType?: SshTunnelType
}

/**
 * Internal bookkeeping for an active database connection.
 */
interface MongoDatabaseEntry {
	client: MongoClient
	tunnel: null | SshTunnel
}

/**
 * Singleton-per-prefix factory for connected MongoClient instances.
 *
 * Each `prefix` maps to one MongoClient, created once and cached.  Env vars
 * are resolved at creation time using the prefix.
 *
 * @example
 * ```ts
 * const rawClient = await MongoDatabaseClient.getClient({ prefix: 'PCGI_RAW' })
 * const ticketingClient = await MongoDatabaseClient.getClient({ prefix: 'PCGI_TICKETING' })
 * ```
 */
export class MongoDatabaseClient {
	private static entries = new Map<string, Promise<MongoDatabaseEntry>>();

	/**
	 * Gracefully tear down all active database connections and SSH tunnels.
	 * Clears the internal cache so subsequent `getClient` calls re-connect.
	 */
	static async disconnectAll(): Promise<void> {
		const entries = await Promise.all(this.entries.values());
		for (const entry of entries) {
			if (entry.tunnel) {
				await entry.tunnel.disconnect();
			}
			await entry.client.close();
		}
		this.entries.clear();
	}

	/**
	 * Get (or create) a connected MongoClient for the given database config.
	 *
	 * Each unique `prefix` produces a singleton client.  The first call
	 * validates env vars, optionally establishes an SSH tunnel, creates the
	 * MongoClient with standard options, attaches event listeners, and
	 * connects.  Subsequent calls return the cached client immediately.
	 *
	 * @param config - Database configuration (env var prefix + optional overrides).
	 * @returns A connected MongoClient instance.
	 */
	static async getClient(config: MongoDatabaseConfig): Promise<MongoClient> {
		const key = config.prefix;

		if (!this.entries.has(key)) {
			const promise = this.createClient(config).catch((error) => {
				this.entries.delete(key);
				throw error;
			});
			this.entries.set(key, promise);
		}

		const entry = await this.entries.get(key);
		if (!entry) throw new Error(`No entry found for key: ${key}`);
		return entry.client;
	}

	/**
	 * Create a new MongoDatabaseEntry by resolving env vars, setting up the
	 * MongoClient with standard options and event listeners, and connecting.
	 */
	private static async createClient(config: MongoDatabaseConfig): Promise<MongoDatabaseEntry> {
		const { clientOptions, prefix } = config;

		Logger.info({ message: `[${prefix}] Connecting to database...` });

		const { tunnel, uri } = await this.getConnectionString(config);

		const client = new MongoClient(uri, {
			connectTimeoutMS: 10_000,
			directConnection: tunnel !== null,
			maxPoolSize: 20,
			minPoolSize: 2,
			readPreference: 'primary',
			replicaSet: process.env[`${prefix}_RS_NAME`],
			retryReads: true,
			retryWrites: true,
			serverSelectionTimeoutMS: 10_000,
			...clientOptions,
		});

		client.on('connectionPoolCreated', () => {
			Logger.info({ message: `[${prefix}] Database connection pool created.` });
		});
		client.on('topologyDescriptionChanged', () => {
			Logger.info({ message: `[${prefix}] Database topology description changed.` });
		});
		client.on('serverDescriptionChanged', () => {
			Logger.info({ message: `[${prefix}] Database server description changed.` });
		});
		client.on('open', () => {
			Logger.info({ message: `[${prefix}] Database connection opened.` });
		});
		client.on('connectionReady', () => {
			Logger.info({ message: `[${prefix}] Database connection is ready.` });
		});
		client.on('close', () => {
			Logger.error({ message: `[${prefix}] Database connection closed unexpectedly.` });
		});
		client.on('reconnect', () => {
			Logger.info({ message: `[${prefix}] Database reconnected.` });
		});
		client.on('error', (error) => {
			Logger.error({ error, message: `[${prefix}] Database connection error:` });
		});

		try {
			await client.connect();
		} catch (error) {
			await client.close().catch(() => {});
			throw error;
		}

		return { client, tunnel };
	}

	/**
	 * Build a MongoDB connection string from env vars.
	 *
	 * Two modes:
	 *   - **Direct** (`TUNNEL_ENABLED=false`): replica-set URI with all three hosts.
	 *   - **SSH tunnel** (`TUNNEL_ENABLED=true`): creates an `SshTunnelService`,
	 *     connects, and returns a `localhost` URI pointing at the tunnel endpoint.
	 *
	 * Validates that all required vars for the chosen mode are set.
	 *
	 * @returns The resolved URI and an optional SSH tunnel reference.
	 */
	private static async getConnectionString(config: MongoDatabaseConfig): Promise<{ tunnel: null | SshTunnel, uri: string }> {
		const { prefix } = config;
		const env = (name: string) => process.env[`${prefix}_${name}`];

		const host1 = env('HOST_1');
		const port1 = env('PORT_1');
		const host2 = env('HOST_2');
		const port2 = env('PORT_2');
		const host3 = env('HOST_3');
		const port3 = env('PORT_3');
		const username = env('USERNAME');
		const password = env('PASSWORD');
		const rsName = env('RS_NAME');

		if (!host1 || !port1) throw new Error(`Missing ${prefix}_HOST_1 or ${prefix}_PORT_1`);
		if (!host2 || !port2) throw new Error(`Missing ${prefix}_HOST_2 or ${prefix}_PORT_2`);
		if (!host3 || !port3) throw new Error(`Missing ${prefix}_HOST_3 or ${prefix}_PORT_3`);
		if (!username || !password) throw new Error(`Missing ${prefix}_USERNAME or ${prefix}_PASSWORD`);
		if (!rsName) throw new Error(`Missing ${prefix}_RS_NAME`);

		const tunnel = config.tunnelType ? createSshTunnelFactory(config.tunnelType)({ dstAddr: host1, dstPort: Number(port1) }) : null;

		if (!tunnel) {
			return {
				tunnel: null,
				uri: `mongodb://${username}:${password}@${host1}:${port1},${host2}:${port2},${host3}:${port3}/`,
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
			uri: `mongodb://${username}:${password}@localhost:${addr.port}/`,
		};
	}
}
