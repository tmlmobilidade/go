/* * */

import { Logger } from '@tmlmobilidade/logger';
import { MongoConnector } from '@tmlmobilidade/mongo';
import { pcgiSshTunnel, SshTunnel } from '@tmlmobilidade/ssh';
import { type Collection, type MongoClientOptions } from 'mongodb';

/* * */

let GLOBAL_PCGIDB_TUNNEL_INSTANCE: SshTunnel | undefined;

/* * */

class PCGIDBValidationsClass {
	//

	public LocationEntity: Collection;
	public ValidationEntity: Collection;

	/**
	 * Establishes a connection to the Mongo database and initializes the collection.
	 * @throws If connection fails.
	 */
	public async connect() {
		//

		//
		// Setup SSH Tunnel, if required

		const pcgidbValidationsConnectionString = await this.getPcgidbValidationsConnectionString();

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

		Logger.info({ message: 'Connecting to PCGIDB Validations...' });

		try {
			// Connect to the MongoDB database
			const mongoConnector = new MongoConnector(pcgidbValidationsConnectionString, mongoClientOptions);
			await mongoConnector.connect();
			// Setup collections
			this.LocationEntity = mongoConnector.client.db('LocationManagement').collection('locationEntity');
			this.ValidationEntity = mongoConnector.client.db('ValidationsManagement').collection('validationEntity');
			// Log success message
			Logger.success('Connected to PCGIDB Validations successfully.');
		} catch (error) {
			throw new Error('Error connecting to PCGIDB Validations:', { cause: error });
		}
	}

	/**
	 * Sets up an SSH Tunnel, if required, and returns the appropriate database URL.
	 * @throws If required environment variables are missing or if the tunnel setup fails.
	 */
	public async getPcgidbValidationsConnectionString() {
		//

		//
		// Check if the required PCGIDB environment variables are set.

		if (!process.env.PCGIDB_VALIDATIONS_USER || !process.env.PCGIDB_VALIDATIONS_PASSWORD) {
			throw new Error('Missing PCGIDB_VALIDATIONS_USER or PCGIDB_VALIDATIONS_PASSWORD environment variable.');
		}

		if (!process.env.PCGIDB_VALIDATIONS_ADDRESS_1 || !process.env.PCGIDB_VALIDATIONS_ADDRESS_2 || !process.env.PCGIDB_VALIDATIONS_ADDRESS_3 || !process.env.PCGIDB_VALIDATIONS_PORT) {
			throw new Error('Missing PCGIDB_VALIDATIONS_ADDRESS_1, PCGIDB_VALIDATIONS_ADDRESS_2, PCGIDB_VALIDATIONS_ADDRESS_3 or PCGIDB_VALIDATIONS_PORT environment variable.');
		}

		//
		// Setup the SSH Tunnel

		GLOBAL_PCGIDB_TUNNEL_INSTANCE = pcgiSshTunnel({ dstAddr: process.env.PCGIDB_VALIDATIONS_ADDRESS_1, dstPort: Number(process.env.PCGIDB_VALIDATIONS_PORT) });

		if (!GLOBAL_PCGIDB_TUNNEL_INSTANCE) {
			return `mongodb://${process.env.PCGIDB_VALIDATIONS_USER}:${process.env.PCGIDB_VALIDATIONS_PASSWORD}@${process.env.PCGIDB_VALIDATIONS_ADDRESS_1}:${process.env.PCGIDB_VALIDATIONS_PORT},${process.env.PCGIDB_VALIDATIONS_ADDRESS_2}:${process.env.PCGIDB_VALIDATIONS_PORT},${process.env.PCGIDB_VALIDATIONS_ADDRESS_3}:${process.env.PCGIDB_VALIDATIONS_PORT}/`;
		}

		//
		Logger.info({ message: 'Setting up SSH Tunnel for PCGIDB Validations...' });

		const sshTunnelConnection = await GLOBAL_PCGIDB_TUNNEL_INSTANCE.connect();

		//
		// Construct the PCGIDB connection string using the SSH Tunnel local address

		const localAddress = sshTunnelConnection.address();

		if (!localAddress || typeof localAddress !== 'object') {
			throw new Error('Failed to retrieve the SSH tunnel address for PCGIDB Validations.');
		}

		return `mongodb://${process.env.PCGIDB_VALIDATIONS_USER}:${process.env.PCGIDB_VALIDATIONS_PASSWORD}@localhost:${localAddress.port}/`;

		//
	}

	//
}

/* * */

/**
 * @deprecated This should not be used anymore. Only inside the `apex` module
 * and then you should use the services provided by the local package.
 */
export const pcgidbValidations = new PCGIDBValidationsClass();
