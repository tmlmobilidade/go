import { Logger } from '@tmlmobilidade/logger';
import { type SshConfig, SshTunnelService, type SshTunnelServiceOptions } from '@tmlmobilidade/ssh';
import { MongoClient, type MongoClientOptions } from 'mongodb';
import { readFileSync } from 'node:fs';

/**
 * Configuration for a Mongo database client.
 *
 * Every database follows the same env var naming convention, scoped by `prefix`:
 *   `{PREFIX}_TUNNEL_ENABLED_NEW` — `"true"` or `"false"`
 *   `{PREFIX}_HOST_1_NEW` / `{PREFIX}_PORT_1_NEW` — replica set seed 1
 *   `{PREFIX}_HOST_2_NEW` / `{PREFIX}_PORT_2_NEW` — replica set seed 2
 *   `{PREFIX}_HOST_3_NEW` / `{PREFIX}_PORT_3_NEW` — replica set seed 3
 *   `{PREFIX}_USER_NEW` / `{PREFIX}_PASSWORD_NEW` — credentials
 *   `{PREFIX}_RS_NAME_NEW` — replica set name
 *   `{PREFIX}_TUNNEL_LOCAL_PORT_NEW` — local port for SSH tunnel
 *   `{PREFIX}_TUNNEL_SSH_HOST_NEW` — SSH bastion host
 *   `{PREFIX}_TUNNEL_SSH_USERNAME_NEW` — SSH user
 *   `{PREFIX}_TUNNEL_SSH_KEY_PATH_NEW` — path to SSH private key file
 *   `{PREFIX}_TUNNEL_SSH_KEY_NEW` — inline SSH private key
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
			directConnection: process.env[`${prefix}_TUNNEL_ENABLED_NEW`] === 'true',
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
		const { prefix } = config;
		const env = (name: string) => process.env[`${prefix}${name}`];

		const tunnelEnabled = env('_TUNNEL_ENABLED');
		if (tunnelEnabled !== 'true' && tunnelEnabled !== 'false') {
			throw new Error(
				`Missing ${prefix}_TUNNEL_ENABLED_NEW. Please indicate whether SSH tunneling is required by setting ${prefix}_TUNNEL_ENABLED_NEW to "true" or "false".`,
			);
		}

		if (!env('_HOST_1') || !env('_PORT_1')) throw new Error(`Missing ${prefix}_HOST_1_NEW or ${prefix}_PORT_1_NEW`);
		if (!env('_HOST_2') || !env('_PORT_2')) throw new Error(`Missing ${prefix}_HOST_2_NEW or ${prefix}_PORT_2_NEW`);
		if (!env('_HOST_3') || !env('_PORT_3')) throw new Error(`Missing ${prefix}_HOST_3_NEW or ${prefix}_PORT_3_NEW`);
		if (!env('_RS_NAME')) throw new Error(`Missing ${prefix}_RS_NAME_NEW`);

		if (tunnelEnabled === 'false') {
			return {
				tunnel: null,
				uri: `mongodb://${env('_USER')}:${env('_PASSWORD')}@${env('_HOST_1')}:${env('_PORT_1')},${env('_HOST_2')}:${env('_PORT_2')},${env('_HOST_3')}:${env('_PORT_3')}/`,
			};
		}

		if (!env('_TUNNEL_LOCAL_PORT')) throw new Error(`Missing ${prefix}_TUNNEL_LOCAL_PORT_NEW`);
		if (!env('_TUNNEL_SSH_HOST') || !env('_TUNNEL_SSH_USERNAME')) throw new Error(`Missing SSH config for ${prefix}`);

		const sshConfig: SshConfig = {
			forwardOptions: {
				dstAddr: env('_HOST_1')!,
				dstPort: Number(env('_PORT_1')),
				srcAddr: 'localhost',
				srcPort: Number(env('_TUNNEL_LOCAL_PORT')),
			},
			serverOptions: {
				port: Number(env('_TUNNEL_LOCAL_PORT')),
			},
			sshOptions: {
				agent: (env('_TUNNEL_SSH_KEY_PATH') || env('_TUNNEL_SSH_KEY')) ? undefined : process.env.SSH_AUTH_SOCK,
				host: env('_TUNNEL_SSH_HOST')!,
				keepaliveCountMax: 3,
				keepaliveInterval: 10_000,
				port: 22,
				privateKey: env('_TUNNEL_SSH_KEY_PATH')
					? readFileSync(env('_TUNNEL_SSH_KEY_PATH')!)
					: env('_TUNNEL_SSH_KEY')
						? env('_TUNNEL_SSH_KEY')
						: undefined,
				username: env('_TUNNEL_SSH_USERNAME')!,
			},
			tunnelOptions: {
				autoClose: false,
				reconnectOnError: true,
			},
		};

		const sshOptions: SshTunnelServiceOptions = { maxRetries: 3 };

		const tunnel = new SshTunnelService(sshConfig, sshOptions);

		Logger.info({ message: `[${prefix}] Setting up SSH Tunnel...` });

		const connection = await tunnel.connect();
		const addr = connection.address();

		if (!addr || typeof addr !== 'object') {
			throw new Error(`[${prefix}] Failed to retrieve SSH tunnel address.`);
		}

		return {
			tunnel,
			uri: `mongodb://${env('_USER')}:${env('_PASSWORD')}@localhost:${addr.port}/`,
		};
	}
}
