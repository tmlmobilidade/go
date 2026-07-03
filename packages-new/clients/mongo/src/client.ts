import { Logger } from '@tmlmobilidade/logger';
import { type SshConfig, SshTunnelService, type SshTunnelServiceOptions } from '@tmlmobilidade/ssh';
import { MongoClient, type MongoClientOptions } from 'mongodb';
import { readFileSync } from 'node:fs';

export interface MongoDatabaseConfig {
	clientOptions?: Partial<MongoClientOptions>
	prefix: string
}

interface MongoDatabaseEntry {
	client: MongoClient
	tunnel: null | SshTunnelService
}

export class MongoDatabaseClient {
	private static entries = new Map<string, Promise<MongoDatabaseEntry>>();

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

	static async getClient(config: MongoDatabaseConfig): Promise<MongoClient> {
		const key = config.prefix;

		if (!this.entries.has(key)) {
			this.entries.set(key, this.createClient(config));
		}

		const entry = await this.entries.get(key)!;
		return entry.client;
	}

	private static async createClient(config: MongoDatabaseConfig): Promise<MongoDatabaseEntry> {
		const { clientOptions, prefix } = config;

		Logger.info({ message: `[${prefix}] Connecting to database...` });

		const { tunnel, uri } = await this.getConnectionString(config);

		const client = new MongoClient(uri, {
			connectTimeoutMS: 10_000,
			directConnection: process.env[`${prefix}_TUNNEL_ENABLED`] === 'true',
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

		await client.connect();
		return { client, tunnel };
	}

	private static async getConnectionString(config: MongoDatabaseConfig): Promise<{ tunnel: null | SshTunnelService, uri: string }> {
		const { prefix } = config;
		const env = (name: string) => process.env[`${prefix}${name}`];

		const tunnelEnabled = env('_TUNNEL_ENABLED');
		if (tunnelEnabled !== 'true' && tunnelEnabled !== 'false') {
			throw new Error(
				`Missing ${prefix}_TUNNEL_ENABLED. Please indicate whether SSH tunneling is required by setting ${prefix}_TUNNEL_ENABLED to "true" or "false".`,
			);
		}

		if (!env('_HOST_1') || !env('_PORT_1')) throw new Error(`Missing ${prefix}_HOST_1 or ${prefix}_PORT_1`);
		if (!env('_HOST_2') || !env('_PORT_2')) throw new Error(`Missing ${prefix}_HOST_2 or ${prefix}_PORT_2`);
		if (!env('_HOST_3') || !env('_PORT_3')) throw new Error(`Missing ${prefix}_HOST_3 or ${prefix}_PORT_3`);
		if (!env('_RS_NAME')) throw new Error(`Missing ${prefix}_RS_NAME`);

		if (tunnelEnabled === 'false') {
			return {
				tunnel: null,
				uri: `mongodb://${env('_USER')}:${env('_PASSWORD')}@${env('_HOST_1')}:${env('_PORT_1')},${env('_HOST_2')}:${env('_PORT_2')},${env('_HOST_3')}:${env('_PORT_3')}/`,
			};
		}

		if (!env('_TUNNEL_LOCAL_PORT')) throw new Error(`Missing ${prefix}_TUNNEL_LOCAL_PORT`);
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
