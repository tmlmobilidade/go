/* * */

import { Logger } from '@tmlmobilidade/logger-backend';
import { pcgiSshTunnel, SshTunnel } from '@tmlmobilidade/ssh';
import { MongoClient } from 'mongodb';

/* * */

export class PCGIValidationsClient {
	//

	private static _instance: null | Promise<PCGIValidationsClient> = null;

	private client: MongoClient;
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
				const instance = new PCGIValidationsClient();
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
		Logger.info({ message: '[PCGIValidationsClient] Connecting to database...' });
		const connectionString = await this.getConnectionString();
		this.client = new MongoClient(connectionString, {
			connectTimeoutMS: 10_000,
			directConnection: this.tunnel ? true : false,
			maxPoolSize: 20,
			minPoolSize: 2,
			readPreference: 'primary',
			replicaSet: process.env.PCGI_VALIDATIONS_RS_NAME,
			retryReads: true,
			retryWrites: true,
			serverSelectionTimeoutMS: 10_000,
		});
		this.client.on('connectionPoolCreated', () => {
			Logger.info({ message: '[PCGIValidationsClient] Database connection pool created.' });
		});
		this.client.on('topologyDescriptionChanged', () => {
			Logger.info({ message: '[PCGIValidationsClient] Database topology description changed.' });
		});
		this.client.on('serverDescriptionChanged', () => {
			Logger.info({ message: '[PCGIValidationsClient] Database server description changed.' });
		});
		this.client.on('open', () => {
			Logger.info({ message: '[PCGIValidationsClient] Database connection opened.' });
		});
		this.client.on('connectionReady', () => {
			Logger.info({ message: '[PCGIValidationsClient] Database connection is ready.' });
		});
		this.client.on('close', () => {
			Logger.error({ message: '[PCGIValidationsClient] Database connection closed unexpectedly.' });
		});
		this.client.on('reconnect', () => {
			Logger.info({ message: '[PCGIValidationsClient] Database reconnected.' });
		});
		this.client.on('error', (error) => {
			Logger.error({ error, message: '[PCGIValidationsClient] Database connection error:' });
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

		if (!process.env.PCGI_VALIDATIONS_HOST_1 || !process.env.PCGI_VALIDATIONS_PORT_1) {
			throw new Error('Missing PCGI_VALIDATIONS_HOST_1 or PCGI_VALIDATIONS_PORT_1');
		}

		if (!process.env.PCGI_VALIDATIONS_HOST_2 || !process.env.PCGI_VALIDATIONS_PORT_2) {
			throw new Error('Missing PCGI_VALIDATIONS_HOST_2 or PCGI_VALIDATIONS_PORT_2');
		}

		if (!process.env.PCGI_VALIDATIONS_HOST_3 || !process.env.PCGI_VALIDATIONS_PORT_3) {
			throw new Error('Missing PCGI_VALIDATIONS_HOST_3 or PCGI_VALIDATIONS_PORT_3');
		}

		if (!process.env.PCGI_VALIDATIONS_RS_NAME) {
			throw new Error('Missing PCGI_VALIDATIONS_RS_NAME');
		}

		this.tunnel = pcgiSshTunnel({ dstAddr: process.env.PCGI_VALIDATIONS_HOST_1, dstPort: Number(process.env.PCGI_VALIDATIONS_PORT_1) });

		if (!this.tunnel) {
			return `mongodb://${process.env.PCGI_VALIDATIONS_USER}:${process.env.PCGI_VALIDATIONS_PASSWORD}@${process.env.PCGI_VALIDATIONS_HOST_1}:${process.env.PCGI_VALIDATIONS_PORT_1},${process.env.PCGI_VALIDATIONS_HOST_2}:${process.env.PCGI_VALIDATIONS_PORT_2},${process.env.PCGI_VALIDATIONS_HOST_3}:${process.env.PCGI_VALIDATIONS_PORT_3}/`;
		}

		Logger.info({ message: '[PCGIValidationsClient] Setting up SSH Tunnel...' });

		const connection = await this.tunnel.connect();
		const addr = connection.address();

		if (!addr || typeof addr !== 'object') {
			throw new Error('[PCGIValidationsClient] Failed to retrieve SSH tunnel address.');
		}

		return `mongodb://${process.env.PCGI_VALIDATIONS_USER}:${process.env.PCGI_VALIDATIONS_PASSWORD}@localhost:${addr.port}/`;
	}

	//
}
