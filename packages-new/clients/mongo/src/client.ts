import { Logger } from '@tmlmobilidade/logger';
import { getSshTunnel, SshTunnelService } from '@tmlmobilidade/ssh';
import { MongoClient, type MongoClientOptions } from 'mongodb';

/**
 * Configuration for a Mongo database client.
 *
 * Every database follows the same env var naming convention, scoped by `prefix`:
 *   `{PREFIX}_HOST_1_NEW` / `{PREFIX}_PORT_1_NEW` — replica set seed 1
 *   `{PREFIX}_HOST_2_NEW` / `{PREFIX}_PORT_2_NEW` — replica set seed 2
 *   `{PREFIX}_HOST_3_NEW` / `{PREFIX}_PORT_3_NEW` — replica set seed 3
 *   `{PREFIX}_USER_NEW` / `{PREFIX}_PASSWORD_NEW` — credentials
 *   `{PREFIX}_RS_NAME_NEW` — replica set name
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
	/** SSH tunnel prefix (e.g. `"GO"`, `"PCGI"`). */
	sshPrefix?: string
}

/**
 * Internal bookkeeping for an active database connection.
 */
interface MongoDatabaseEntry {
	client: MongoClient
	tunnel: null | SshTunnelService
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

		const entry = await this.entries.get(key)!;
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
			directConnection: tunnel === null,
			maxPoolSize: 20,
			minPoolSize: 2,
			readPreference: 'primary',
			replicaSet: process.env[`${prefix}_RS_NAME_NEW`],
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

		await client.connect();
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
	private static async getConnectionString(config: MongoDatabaseConfig): Promise<{ tunnel: null | SshTunnelService, uri: string }> {
		const { prefix, sshPrefix } = config;
		const env = (name: string) => process.env[`${prefix}_${name}_NEW`];

		if (!env('HOST_1') || !env('PORT_1')) throw new Error(`Missing ${prefix}_HOST_1_NEW or ${prefix}_PORT_1_NEW`);
		if (!env('HOST_2') || !env('PORT_2')) throw new Error(`Missing ${prefix}_HOST_2_NEW or ${prefix}_PORT_2_NEW`);
		if (!env('HOST_3') || !env('PORT_3')) throw new Error(`Missing ${prefix}_HOST_3_NEW or ${prefix}_PORT_3_NEW`);
		if (!env('RS_NAME')) throw new Error(`Missing ${prefix}_RS_NAME_NEW`);

		const tunnel = getSshTunnel({
			forwardOptions: {
				dstAddr: env('HOST_1')!,
				dstPort: Number(env('PORT_1')),
			},
			prefix: sshPrefix ?? prefix,
		});

		if (!tunnel) {
			return {
				tunnel: null,
				uri: `mongodb://${env('USER')}:${env('PASSWORD')}@${env('HOST_1')}:${env('PORT_1')},${env('HOST_2')}:${env('PORT_2')},${env('HOST_3')}:${env('PORT_3')}/`,
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
			uri: `mongodb://${env('USER')}:${env('PASSWORD')}@localhost:${addr.port}/`,
		};
	}
}
