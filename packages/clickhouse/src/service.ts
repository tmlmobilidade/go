/* * */

import { ClickHouseClient, createClient } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';
import { type SshConfig, SshTunnelService, type SshTunnelServiceOptions } from '@tmlmobilidade/ssh';

/* * */

export class ClickHouseService {
	//

	private static _instance: ClickHouseService;
	private static _instancePromise: null | Promise<ClickHouseService> = null;

	private client: ClickHouseClient;
	private tunnel: null | SshTunnelService = null;

	/**
	 * Returns the singleton instance of the subclass.
	 */
	static async getInstance() {
		// If already initialized, return immediately
		if (this._instance) return this._instance;
		// If there is a promise for initialization in progress, await it.
		// This handles the case where multiple calls to getInstance()
		// happen concurrently before initialization completes.
		if (this._instancePromise) return this._instancePromise;
		// Otherwise, start initialization and store the promise.
		this._instancePromise = (async () => {
			const instance = new ClickHouseService();
			await instance.connect();
			this._instance = instance;
			return instance;
		})();
		// Return the instance once ready.
		return this._instancePromise;
	}

	/**
	 * This is an escape hatch for executing queries that are not covered by the service's methods.
	 * It should be used with caution. Always prefer using the provided methods for common operations
	 * like creating tables or databases, or querying data, as they include safety checks and error handling.
	 * Directly using the client can lead to SQL injection vulnerabilities or other unintended side effects.
	 * @returns The ClickHouse client.
	 */
	public async getClient() {
		while (!this.client) {
			Logger.info('ClickHouse client not initialized yet. Waiting...');
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		return this.client;
	}

	/**
	 * Connects to ClickHouse, setting up the client instance.
	 * If SSH tunneling is required, it establishes the tunnel first.
	 * This method is called internally by the service and should not be used directly.
	 */
	private async connect() {
		const clickhouseConnectionString = await this.getClickhouseConnectionString();
		this.client = createClient({ url: clickhouseConnectionString });
	}

	/**
	 * Constructs the ClickHouse connection string based on environment variables
	 * and SSH tunneling configuration, and handles both direct connections and SSH-tunneled
	 * connections, validating the necessary environment variables for each case.
	 * This method is called internally by the service and should not be used directly.
	 * @throws Will throw an error if required environment variables are missing or if the SSH tunnel setup fails.
	 * @returns A promise that resolves to the ClickHouse connection string.
	 */
	private async getClickhouseConnectionString(): Promise<string> {
		//

		//
		// Validate required environment variables

		if (process.env.CLICKHOUSE_TUNNEL_ENABLED !== 'true' && process.env.CLICKHOUSE_TUNNEL_ENABLED !== 'false') {
			throw new Error('Missing CLICKHOUSE_TUNNEL_ENABLED. Please indicate whether SSH tunneling is required by setting CLICKHOUSE_TUNNEL_ENABLED to "true" or "false".');
		}

		if (!process.env.CLICKHOUSE_HOST || !process.env.CLICKHOUSE_PORT) {
			throw new Error('Missing CLICKHOUSE_HOST or CLICKHOUSE_PORT');
		}

		if (process.env.CLICKHOUSE_TUNNEL_ENABLED === 'false') {
			return `http://${process.env.CLICKHOUSE_USER}:${process.env.CLICKHOUSE_PASSWORD}@${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT}`;
		}

		// SSH required
		if (!process.env.CLICKHOUSE_TUNNEL_LOCAL_PORT) {
			throw new Error('Missing CLICKHOUSE_TUNNEL_LOCAL_PORT');
		}

		if (!process.env.CLICKHOUSE_TUNNEL_SSH_HOST || !process.env.CLICKHOUSE_TUNNEL_SSH_USERNAME) {
			throw new Error('Missing SSH config');
		}

		const sshConfig: SshConfig = {
			forwardOptions: {
				dstAddr: process.env.CLICKHOUSE_HOST,
				dstPort: Number(process.env.CLICKHOUSE_PORT),
				srcAddr: 'localhost',
				srcPort: Number(process.env.CLICKHOUSE_TUNNEL_LOCAL_PORT),
			},
			serverOptions: {
				port: Number(process.env.CLICKHOUSE_TUNNEL_LOCAL_PORT),
			},
			sshOptions: {
				agent: process.env.SSH_AUTH_SOCK,
				host: process.env.CLICKHOUSE_TUNNEL_SSH_HOST,
				keepaliveCountMax: 3,
				keepaliveInterval: 10_000,
				port: 22,
				username: process.env.CLICKHOUSE_TUNNEL_SSH_USERNAME,
			},
			tunnelOptions: {
				autoClose: false,
				reconnectOnError: true,
			},
		};

		const sshOptions: SshTunnelServiceOptions = {
			maxRetries: 3,
		};

		if (!this.tunnel) {
			this.tunnel = new SshTunnelService(sshConfig, sshOptions);
		}

		Logger.info('Setting up SSH Tunnel for ClickHouse...');

		const connection = await this.tunnel.connect();
		const addr = connection.address();

		if (!addr || typeof addr !== 'object') {
			throw new Error('Failed to retrieve SSH tunnel address');
		}

		// ClickHouse HTTP interface
		return `http://${process.env.CLICKHOUSE_USER}:${process.env.CLICKHOUSE_PASSWORD}@localhost:${addr.port}`;
	}

	//
}
