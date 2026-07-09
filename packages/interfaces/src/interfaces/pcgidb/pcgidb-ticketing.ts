/* * */

import { Logger } from '@tmlmobilidade/logger';
import { MongoConnector } from '@tmlmobilidade/mongo';
import { getSshTunnel, SshTunnelService } from '@tmlmobilidade/ssh';
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

		Logger.info({ message: 'Connecting to PCGIDB Ticketing...' });

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
		// Setup the SSH Tunnel

		GLOBAL_PCGIDB_TUNNEL_INSTANCE = getSshTunnel({
			forwardOptions: { dstAddr: process.env.PCGIDB_TICKETING_ADDRESS_1, dstPort: Number(process.env.PCGIDB_TICKETING_PORT) },
			prefix: 'PCGI',
		});

		if (!GLOBAL_PCGIDB_TUNNEL_INSTANCE) {
			return `mongodb://${process.env.PCGIDB_TICKETING_USER}:${process.env.PCGIDB_TICKETING_PASSWORD}@${process.env.PCGIDB_TICKETING_ADDRESS_1}:${process.env.PCGIDB_TICKETING_PORT},${process.env.PCGIDB_TICKETING_ADDRESS_2}:${process.env.PCGIDB_TICKETING_PORT},${process.env.PCGIDB_TICKETING_ADDRESS_3}:${process.env.PCGIDB_TICKETING_PORT}/`;
		}

		Logger.info({ message: 'Setting up SSH Tunnel for PCGIDB Ticketing...' });

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

/**
 * @deprecated This should not be used anymore. Only inside the `apex` module
 * and then you should use the services provided by the local package.
 */
export const pcgidbTicketing = new PCGIDBTicketingClass();
