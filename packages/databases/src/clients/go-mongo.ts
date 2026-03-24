/* * */

import { Logger } from '@tmlmobilidade/logger';
import { type SshConfig, SshTunnelService, type SshTunnelServiceOptions } from '@tmlmobilidade/ssh';
import { MongoClient } from 'mongodb';

/* * */

export class GOMongoClient {
	//

	private static _instance: null | Promise<GOMongoClient> = null;

	private client: MongoClient;
	private tunnel: null | SshTunnelService = null;

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
				const instance = new GOMongoClient();
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
	 * Connects to Mongo, setting up the client instance.
	 * If SSH tunneling is required, it establishes the tunnel first.
	 * This method is called internally by the service and should not be used directly.
	 */
	private async connect() {
		Logger.info('[GOMongoClient] Connecting to database...');
		const connectionString = await this.getConnectionString();
		this.client = new MongoClient(connectionString);
		this.client.on('close', () => {
			console.warn('[GOMongoClient] Database connection closed unexpectedly.');
		});
		this.client.on('reconnect', () => {
			console.log('[GOMongoClient] Database reconnected.');
		});
		await this.client.connect();
	}

	/**
	 * Constructs the connection string based on environment variables
	 * and SSH tunneling configuration, and handles both direct connections and SSH-tunneled
	 * connections, validating the necessary environment variables for each case.
	 * This method is called internally by the service and should not be used directly.
	 * @throws Will throw an error if required environment variables are missing or if the SSH tunnel setup fails.
	 * @returns A promise that resolves to the Mongo connection string.
	 */
	private async getConnectionString(): Promise<string> {
		//

		//
		// Validate required environment variables

		if (process.env.GO_MONGO_TUNNEL_ENABLED !== 'true' && process.env.GO_MONGO_TUNNEL_ENABLED !== 'false') {
			throw new Error('Missing GO_MONGO_TUNNEL_ENABLED. Please indicate whether SSH tunneling is required by setting GO_MONGO_TUNNEL_ENABLED to "true" or "false".');
		}

		if (!process.env.GO_MONGO_HOST_1 || !process.env.GO_MONGO_PORT_1) {
			throw new Error('Missing GO_MONGO_HOST_1 or GO_MONGO_PORT_1');
		}

		if (!process.env.GO_MONGO_HOST_2 || !process.env.GO_MONGO_PORT_2) {
			throw new Error('Missing GO_MONGO_HOST_2 or GO_MONGO_PORT_2');
		}

		if (!process.env.GO_MONGO_HOST_3 || !process.env.GO_MONGO_PORT_3) {
			throw new Error('Missing GO_MONGO_HOST_3 or GO_MONGO_PORT_3');
		}

		if (process.env.GO_MONGO_TUNNEL_ENABLED === 'false') {
			return `mongodb://${process.env.GO_MONGO_USER}:${process.env.GO_MONGO_PASSWORD}@${process.env.GO_MONGO_HOST_1}:${process.env.GO_MONGO_PORT_1},${process.env.GO_MONGO_HOST_2}:${process.env.GO_MONGO_PORT_2},${process.env.GO_MONGO_HOST_3}:${process.env.GO_MONGO_PORT_3}/`;
		}

		// SSH required
		if (!process.env.GO_MONGO_TUNNEL_LOCAL_PORT) {
			throw new Error('Missing GO_MONGO_TUNNEL_LOCAL_PORT');
		}

		if (!process.env.GO_MONGO_TUNNEL_SSH_HOST || !process.env.GO_MONGO_TUNNEL_SSH_USERNAME) {
			throw new Error('Missing SSH config');
		}

		const sshConfig: SshConfig = {
			forwardOptions: {
				dstAddr: process.env.GO_MONGO_HOST_1,
				dstPort: Number(process.env.GO_MONGO_PORT_1),
				srcAddr: 'localhost',
				srcPort: Number(process.env.GO_MONGO_TUNNEL_LOCAL_PORT),
			},
			serverOptions: {
				port: Number(process.env.GO_MONGO_TUNNEL_LOCAL_PORT),
			},
			sshOptions: {
				agent: process.env.SSH_AUTH_SOCK,
				host: process.env.GO_MONGO_TUNNEL_SSH_HOST,
				keepaliveCountMax: 3,
				keepaliveInterval: 10_000,
				port: 22,
				username: process.env.GO_MONGO_TUNNEL_SSH_USERNAME,
			},
			tunnelOptions: {
				autoClose: false,
				reconnectOnError: true,
			},
		};

		const sshOptions: SshTunnelServiceOptions = {
			maxRetries: 3,
		};

		this.tunnel = new SshTunnelService(sshConfig, sshOptions);

		Logger.info('[GOMongoClient] Setting up SSH Tunnel...');

		const connection = await this.tunnel.connect();
		const addr = connection.address();

		if (!addr || typeof addr !== 'object') {
			throw new Error('[GOMongoClient] Failed to retrieve SSH tunnel address.');
		}

		return `mongodb://${process.env.GO_MONGO_USER}:${process.env.GO_MONGO_PASSWORD}@localhost:${addr.port}/`;
	}

	//
}
