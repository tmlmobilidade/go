/* * */

import { Logger } from '@tmlmobilidade/logger';
import { MongoConnector } from '@tmlmobilidade/mongo';
import { type SshConfig, SshTunnelService, type SshTunnelServiceOptions } from '@tmlmobilidade/ssh';
import { type Collection, type MongoClientOptions } from 'mongodb';

/* * */

let GLOBAL_PCGIDB_TUNNEL_INSTANCE: SshTunnelService | undefined;

/* * */

class PCGIDBTicketingClass {
	//

	public SalesEntity: Collection;

	/**
	 * Establishes a connection to the Mongo database and initializes the collection.
	 * @throws If connection fails.
	 */
	public async connect() {
		//

		//
		// Setup SSH Tunnel, if required

		const pcgidbTicketingConnectionString = await this.getPcgidbTicketingConnectionString();

		//
		// Get the database URI from environment variables

		const mongoClientOptions: MongoClientOptions = {
			connectTimeoutMS: 10_000,
			directConnection: process.env.ENVIRONMENT === 'production' || process.env.ENVIRONMENT === 'staging' ? false : true,
			maxPoolSize: 20,
			minPoolSize: 2,
			readPreference: 'secondaryPreferred',
			serverSelectionTimeoutMS: 10_000,
		};

		Logger.info('Connecting to PCGIDB Ticketing...');

		try {
			// Connect to the MongoDB database
			const mongoConnector = new MongoConnector(pcgidbTicketingConnectionString, mongoClientOptions);
			await mongoConnector.connect();
			// Setup collections
			this.SalesEntity = mongoConnector.client.db('SalesManagement').collection('salesEntity');
			// Log success message
			Logger.success('Connected to PCGIDB Ticketing successfully.');
		} catch (error) {
			throw new Error('Error connecting to PCGIDB Ticketing:', { cause: error });
		}
	}

	/**
	 * Sets up an SSH Tunnel, if required, and returns the appropriate database URL.
	 * @throws If required environment variables are missing or if the tunnel setup fails.
	 */
	public async getPcgidbTicketingConnectionString() {
		//

		//
		// Check if the required PCGIDB environment variables are set.

		if (!process.env.PCGIDB_TICKETING_USER || !process.env.PCGIDB_TICKETING_PASSWORD) {
			throw new Error('Missing PCGIDB_TICKETING_USER or PCGIDB_TICKETING_PASSWORD environment variable.');
		}

		if (!process.env.PCGIDB_TICKETING_ADDRESS_1 || !process.env.PCGIDB_TICKETING_ADDRESS_2 || !process.env.PCGIDB_TICKETING_ADDRESS_3 || !process.env.PCGIDB_TICKETING_PORT) {
			throw new Error('Missing PCGIDB_TICKETING_ADDRESS_1, PCGIDB_TICKETING_ADDRESS_2, PCGIDB_TICKETING_ADDRESS_3 or PCGIDB_TICKETING_PORT environment variable.');
		}

		//
		// Check if the SSH Tunnel is required based on the environment.
		// In 'production' and 'staging', we assume direct connection is used.

		if (process.env.ENVIRONMENT === 'production' || process.env.ENVIRONMENT === 'staging') {
			return `mongodb://${process.env.PCGIDB_TICKETING_USER}:${process.env.PCGIDB_TICKETING_PASSWORD}@${process.env.PCGIDB_TICKETING_ADDRESS_1}:${process.env.PCGIDB_TICKETING_PORT},${process.env.PCGIDB_TICKETING_ADDRESS_2}:${process.env.PCGIDB_TICKETING_PORT},${process.env.PCGIDB_TICKETING_ADDRESS_3}:${process.env.PCGIDB_TICKETING_PORT}/`;
		}

		//
		// If we're here, then the SSH Tunnel is to be used.
		// Check if the required SSH Tunnel environment variables are set.

		if (!process.env.PCGIDB_TUNNEL_LOCAL_PORT) {
			throw new Error('Missing PCGIDB_TUNNEL_LOCAL_PORT environment variable.');
		}

		if (!process.env.PCGIDB_TUNNEL_SSH_HOST || !process.env.PCGIDB_TUNNEL_SSH_USERNAME) {
			throw new Error('Missing PCGIDB_TUNNEL_SSH_HOST or PCGIDB_TUNNEL_SSH_USERNAME environment variable.');
		}

		//
		// Setup the SSH Tunnel connection configuration

		const sshConfig: SshConfig = {
			forwardOptions: {
				dstAddr: process.env.PCGIDB_TICKETING_ADDRESS_1,
				dstPort: Number(process.env.PCGIDB_TICKETING_PORT),
				srcAddr: 'localhost',
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
				port: 22,
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

		Logger.info('Setting up SSH Tunnel for PCGIDB Ticketing...');

		const sshTunnelConnection = await GLOBAL_PCGIDB_TUNNEL_INSTANCE.connect();

		//
		// Construct the PCGIDB connection string using the SSH Tunnel local address

		const localAddress = sshTunnelConnection.address();

		if (!localAddress || typeof localAddress !== 'object') {
			throw new Error('Failed to retrieve the SSH tunnel address for PCGIDB Ticketing.');
		}

		return `mongodb://${process.env.PCGIDB_TICKETING_USER}:${process.env.PCGIDB_TICKETING_PASSWORD}@localhost:${localAddress.port}/`;

		//
	}

	//
}

/* * */

export const pcgidbTicketing = new PCGIDBTicketingClass();
