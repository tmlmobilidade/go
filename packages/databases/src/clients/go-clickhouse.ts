/* * */

import { ClickHouseClient, ClickHouseLogLevel, createClient } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger-logger-backend';
import { goSshTunnel, SshTunnel } from '@tmlmobilidade/ssh';

/* * */

export class GOClickHouseClient {
	//

	private static _instance: null | Promise<GOClickHouseClient> = null;

	private client: ClickHouseClient;
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
				const instance = new GOClickHouseClient();
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
	 * Connects to ClickHouse, setting up the client instance.
	 * If SSH tunneling is required, it establishes the tunnel first.
	 * This method is called internally by the service and should not be used directly.
	 */
	private async connect() {
		Logger.info({ message: '[GOClickHouseClient] Connecting to database...' });
		const connectionString = await this.getConnectionString();
		this.client = createClient({
			clickhouse_settings: {
				async_insert: 1,
				connect_timeout: 360 * 1000,
				http_receive_timeout: 360 * 1000,
				http_send_timeout: 360 * 1000,
				max_execution_time: 360,
				wait_for_async_insert: 0,
			},
			compression: {
				request: true,
				response: true,
			},
			log: {
				level: ClickHouseLogLevel.OFF,
			},
			request_timeout: 360 * 1000,
			url: connectionString,
		});
	}

	/**
	 * Constructs the connection string based on environment variables
	 * and SSH tunneling configuration, and handles both direct connections and SSH-tunneled
	 * connections, validating the necessary environment variables for each case.
	 * This method is called internally by the service and should not be used directly.
	 * @throws Will throw an error if required environment variables are missing or if the SSH tunnel setup fails.
	 * @returns A promise that resolves to the ClickHouse connection string.
	 */
	private async getConnectionString(): Promise<string> {
		//

		//
		// Validate required environment variables
		if (!process.env.GO_CLICKHOUSE_HOST || !process.env.GO_CLICKHOUSE_PORT) {
			throw new Error('Missing GO_CLICKHOUSE_HOST or GO_CLICKHOUSE_PORT');
		}

		//
		// Setup SSH Tunnel

		this.tunnel = goSshTunnel({ dstAddr: process.env.GO_CLICKHOUSE_HOST, dstPort: Number(process.env.GO_CLICKHOUSE_PORT) });

		if (!this.tunnel) {
			return `http://${process.env.GO_CLICKHOUSE_USER}:${process.env.GO_CLICKHOUSE_PASSWORD}@${process.env.GO_CLICKHOUSE_HOST}:${process.env.GO_CLICKHOUSE_PORT}`;
		}

		Logger.info({ message: '[GOClickHouseClient] Setting up SSH Tunnel...' });

		const connection = await this.tunnel.connect();
		const addr = connection.address();

		if (!addr || typeof addr !== 'object') {
			throw new Error('[GOClickHouseClient] Failed to retrieve SSH tunnel address.');
		}

		return `http://${process.env.GO_CLICKHOUSE_USER}:${process.env.GO_CLICKHOUSE_PASSWORD}@localhost:${addr.port}`;
	}

	//
}
