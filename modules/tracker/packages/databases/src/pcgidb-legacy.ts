/* * */

import { Logger } from '@tmlmobilidade/logger-logger-backend';
import { MongoConnector } from '@tmlmobilidade/mongo';
import { pcgiSshTunnel, SshTunnel } from '@tmlmobilidade/ssh';
import { type Collection, type MongoClientOptions } from 'mongodb';

/* * */

let GLOBAL_PCGIDB_TUNNEL_INSTANCE: SshTunnel | undefined;

/* * */

class PCGIDBLegacyClass {
	//

	public VehicleEventsCore: Collection;
	public VehicleEventsLog: Collection;

	/**
	 * Establishes a connection to the Mongo database and initializes the collection.
	 * @throws If connection fails.
	 */
	public async connect() {
		//

		//
		// Setup SSH Tunnel, if required

		const pcgidbLegacyConnectionString = await this.getPcgidbLegacyConnectionString();

		//
		// Get the database URI from environment variables

		const mongoClientOptions: MongoClientOptions = {
			connectTimeoutMS: 10_000,
			maxPoolSize: 20,
			minPoolSize: 2,
			readPreference: 'secondaryPreferred',
			serverSelectionTimeoutMS: 10_000,
		};

		Logger.info({ message: 'Connecting to PCGIDB Legacy...' });

		try {
			// Connect to the MongoDB database
			const mongoConnector = new MongoConnector(pcgidbLegacyConnectionString, mongoClientOptions);
			await mongoConnector.connect();
			// Setup collections
			this.VehicleEventsCore = mongoConnector.client.db('CoreManagement').collection('VehicleEvents');
			this.VehicleEventsLog = mongoConnector.client.db('OfferApiLog').collection('VehicleEvents');
			// Log success message
			Logger.success('Connected to PCGIDB Legacy successfully.');
		} catch (error) {
			throw new Error('Error connecting to PCGIDB Legacy:', { cause: error });
		}
	}

	/**
	 * Sets up an SSH Tunnel, if required, and returns the appropriate database URL.
	 * @throws If required environment variables are missing or if the tunnel setup fails.
	 */
	public async getPcgidbLegacyConnectionString() {
		//

		//
		// Check if the required PCGIDB environment variables are set.

		if (!process.env.PCGIDB_LEGACY_USER || !process.env.PCGIDB_LEGACY_PASSWORD) {
			throw new Error('Missing PCGIDB_LEGACY_USER or PCGIDB_LEGACY_PASSWORD environment variable.');
		}

		if (!process.env.PCGIDB_LEGACY_ADDRESS_1 || !process.env.PCGIDB_LEGACY_ADDRESS_2 || !process.env.PCGIDB_LEGACY_ADDRESS_3 || !process.env.PCGIDB_LEGACY_PORT) {
			throw new Error('Missing PCGIDB_LEGACY_ADDRESS_1, PCGIDB_LEGACY_ADDRESS_2, PCGIDB_LEGACY_ADDRESS_3 or PCGIDB_LEGACY_PORT environment variable.');
		}

		//
		// Setup the SSH Tunnel

		GLOBAL_PCGIDB_TUNNEL_INSTANCE = pcgiSshTunnel({ dstAddr: process.env.PCGIDB_LEGACY_ADDRESS_1, dstPort: Number(process.env.PCGIDB_LEGACY_PORT) });

		if (!GLOBAL_PCGIDB_TUNNEL_INSTANCE) {
			return `mongodb://${process.env.PCGIDB_LEGACY_USER}:${process.env.PCGIDB_LEGACY_PASSWORD}@${process.env.PCGIDB_LEGACY_ADDRESS_1}:${process.env.PCGIDB_LEGACY_PORT},${process.env.PCGIDB_LEGACY_ADDRESS_2}:${process.env.PCGIDB_LEGACY_PORT},${process.env.PCGIDB_LEGACY_ADDRESS_3}:${process.env.PCGIDB_LEGACY_PORT}/`;
		}

		Logger.info({ message: 'Setting up SSH Tunnel for PCGIDB Legacy...' });

		const sshTunnelConnection = await GLOBAL_PCGIDB_TUNNEL_INSTANCE.connect();

		//
		// Construct the PCGIDB connection string using the SSH Tunnel local address

		const localAddress = sshTunnelConnection.address();

		if (!localAddress || typeof localAddress !== 'object') {
			throw new Error('Failed to retrieve the SSH tunnel address for PCGIDB Legacy.');
		}

		return `mongodb://${process.env.PCGIDB_LEGACY_USER}:${process.env.PCGIDB_LEGACY_PASSWORD}@localhost:${localAddress.port}/?directConnection=true`;

		//
	}

	//
}

/* * */

export const pcgidbLegacy = new PCGIDBLegacyClass();
