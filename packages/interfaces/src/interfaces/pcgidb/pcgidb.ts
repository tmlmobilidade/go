/* * */

import { Logger } from '@tmlmobilidade/logger';
import { MongoConnector } from '@tmlmobilidade/mongo';
import { type SshConfig, SshTunnelService, type SshTunnelServiceOptions } from '@tmlmobilidade/ssh';
import { type Collection, type MongoClientOptions } from 'mongodb';

/* * */

let GLOBAL_PCGIDB_TUNNEL_INSTANCE: SshTunnelService | undefined;

/* * */

class PCGIDBClass {
	//

	LocationEntity: Collection;
	SalesEntity: Collection;
	ValidationEntity: Collection;
	VehicleEvents: Collection;

	/**
	 * Establishes a connection to the Mongo database and initializes the collection.
	 * @throws If connection fails.
	 */
	public async connect() {
		//

		//
		// Setup SSH Tunnel, if required

		const pcgidbConnectionString = await this.getPcgidbConnectionString();

		console.log('pcgidbConnectionString', pcgidbConnectionString);

		//
		// Get the database URI from environment variables

		const mongoClientOptions: MongoClientOptions = {
			connectTimeoutMS: 10_000,
			directConnection: true,
			maxPoolSize: 20,
			minPoolSize: 2,
			readPreference: 'secondaryPreferred',
			serverSelectionTimeoutMS: 10_000,
		};

		Logger.info('Connecting to PCGIDB...');

		try {
			// Connect to the MongoDB database
			const mongoConnector = new MongoConnector(pcgidbConnectionString, mongoClientOptions);
			await mongoConnector.connect();
			// Setup collections
			this.LocationEntity = mongoConnector.client.db('LocationManagement').collection('locationsEntity');
			this.SalesEntity = mongoConnector.client.db('SalesManagement').collection('salesEntity');
			this.ValidationEntity = mongoConnector.client.db('ValidationsManagement').collection('validationsEntity');
			this.VehicleEvents = mongoConnector.client.db('CoreManagement').collection('VehicleEvents');
			// Log success message
			Logger.success('Connected to PCGIDB successfully.');
		}
		catch (error) {
			throw new Error('Error connecting to PCGIDB:', { cause: error });
		}
	}

	/**
	 * Sets up an SSH Tunnel, if required, and returns the appropriate database URL.
	 * @throws If required environment variables are missing or if the tunnel setup fails.
	 */
	public async getPcgidbConnectionString() {
		//

		//
		// Check if the required PCGIDB environment variables are set.

		if (!process.env.PCGIDB_USER || !process.env.PCGIDB_PASSWORD) {
			throw new Error('Missing PCGIDB_USER or PCGIDB_PASSWORD environment variable.');
		}

		if (!process.env.PCGIDB_ADDRESS || !process.env.PCGIDB_PORT) {
			throw new Error('Missing PCGIDB_ADDRESS or PCGIDB_PORT environment variable.');
		}

		//
		// Check if the SSH Tunnel is required based on the environment.
		// In 'production' and 'staging', we assume direct connection is used.

		if (process.env.ENVIRONMENT === 'production' || process.env.ENVIRONMENT === 'staging') {
			return `mongodb://${process.env.PCGIDB_USER}:${process.env.PCGIDB_PASSWORD}@${process.env.PCGIDB_ADDRESS}:${process.env.PCGIDB_PORT}/`;
		}

		//
		// If we're here, then the SSH Tunnel is to be used.
		// Check if the required SSH Tunnel environment variables are set.

		if (!process.env.PCGIDB_ADDRESS || !process.env.PCGIDB_PORT) {
			throw new Error('Missing PCGIDB_ADDRESS or PCGIDB_PORT environment variable.');
		}

		if (!process.env.PCGIDB_TUNNEL_LOCAL_HOST || !process.env.PCGIDB_TUNNEL_LOCAL_PORT) {
			throw new Error('Missing PCGIDB_TUNNEL_LOCAL_HOST or PCGIDB_TUNNEL_LOCAL_PORT environment variable.');
		}

		if (!process.env.PCGIDB_TUNNEL_SSH_HOST || !process.env.PCGIDB_TUNNEL_SSH_PORT || !process.env.PCGIDB_TUNNEL_SSH_USERNAME) {
			throw new Error('Missing PCGIDB_TUNNEL_SSH_HOST, PCGIDB_TUNNEL_SSH_PORT or PCGIDB_TUNNEL_SSH_USERNAME environment variable.');
		}

		//
		// Setup the SSH Tunnel connection configuration

		const sshConfig: SshConfig = {
			forwardOptions: {
				dstAddr: process.env.PCGIDB_ADDRESS,
				dstPort: Number(process.env.PCGIDB_PORT),
				srcAddr: process.env.PCGIDB_TUNNEL_LOCAL_HOST,
				srcPort: Number(process.env.PCGIDB_TUNNEL_LOCAL_PORT),
			},
			serverOptions: {
				port: Number(process.env.PCGIDB_TUNNEL_LOCAL_PORT),
			},
			sshOptions: {
				/**
				 * Using SSH Agent for authentication.
				 * Ensure that your SSH key is added to the SSH agent beforehand.
				 * @see https://developer.1password.com/docs/ssh/agent/compatibility/#ssh-auth-sock
				 */
				agent: process.env.SSH_AUTH_SOCK,
				host: process.env.PCGIDB_TUNNEL_SSH_HOST,
				keepaliveCountMax: 3, // Retry 3 times before closing the connection
				keepaliveInterval: 10000, // Send keep-alive every 10 seconds
				port: Number(process.env.PCGIDB_TUNNEL_SSH_PORT),
				username: process.env.PCGIDB_TUNNEL_SSH_USERNAME,
			},
			tunnelOptions: {
				autoClose: false,
				reconnectOnError: true,
			},
		};

		const sshOptions: SshTunnelServiceOptions = {
			maxRetries: 3,
		};

		//
		// Actually create the SSH Tunnel connection

		if (!GLOBAL_PCGIDB_TUNNEL_INSTANCE) {
			GLOBAL_PCGIDB_TUNNEL_INSTANCE = new SshTunnelService(sshConfig, sshOptions);
		}

		Logger.info('Setting up SSH Tunnel for PCGIDB...');

		const sshTunnelConnection = await GLOBAL_PCGIDB_TUNNEL_INSTANCE.connect();

		//
		// Construct the PCGIDB connection string using the SSH Tunnel local address

		const localAddress = sshTunnelConnection.address();

		if (!localAddress || typeof localAddress !== 'object') {
			throw new Error('Failed to retrieve the SSH tunnel address.');
		}

		return `mongodb://${process.env.PCGIDB_USER}:${process.env.PCGIDB_PASSWORD}@${process.env.PCGIDB_TUNNEL_LOCAL_HOST}:${localAddress.port}/`;

		//
	}

	//
}

/* * */

export const pcgidb = new PCGIDBClass();
