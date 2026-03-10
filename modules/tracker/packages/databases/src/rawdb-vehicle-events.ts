/* eslint-disable @typescript-eslint/naming-convention */

/* * */

import { Logger } from '@tmlmobilidade/logger';
import { MongoConnector } from '@tmlmobilidade/mongo';
import { type SshConfig, SshTunnelService, type SshTunnelServiceOptions } from '@tmlmobilidade/ssh';
import { type Collection, type MongoClientOptions } from 'mongodb';

/* * */

let GLOBAL_RAWDB_TUNNEL_INSTANCE: SshTunnelService | undefined;

/* * */

class RAWDBVehicleEventsClass {
	//

	public RawVehicleEvents: Collection;

	/**
	 * Establishes a connection to the Mongo database and initializes the collection.
	 * @throws If connection fails.
	 */
	public async connect() {
		//

		//
		// Setup SSH Tunnel, if required

		const rawdbVehicleEventsConnectionString = await this.getRawdbVehicleEventsConnectionString();

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

		Logger.info('Connecting to RAWDB VehicleEvents...');

		try {
			// Connect to the MongoDB database
			const mongoConnector = new MongoConnector(rawdbVehicleEventsConnectionString, mongoClientOptions);
			await mongoConnector.connect();
			// Setup collections
			this.RawVehicleEvents = mongoConnector.client.db('production').collection('raw_vehicle_events');
			// Log success message
			Logger.success('Connected to RAWDB VehicleEvents successfully.');
		} catch (error) {
			throw new Error('Error connecting to RAWDB VehicleEvents:', { cause: error });
		}
	}

	/**
	 * Sets up an SSH Tunnel, if required, and returns the appropriate database URL.
	 * @throws If required environment variables are missing or if the tunnel setup fails.
	 */
	public async getRawdbVehicleEventsConnectionString() {
		//

		//
		// Check if the required RAWDB environment variables are set.

		if (!process.env.RAWDB_VEHICLE_EVENTS_USER || !process.env.RAWDB_VEHICLE_EVENTS_PASSWORD) {
			throw new Error('Missing RAWDB_VEHICLE_EVENTS_USER or RAWDB_VEHICLE_EVENTS_PASSWORD environment variable.');
		}

		if (!process.env.RAWDB_VEHICLE_EVENTS_ADDRESS_1 || !process.env.RAWDB_VEHICLE_EVENTS_ADDRESS_2 || !process.env.RAWDB_VEHICLE_EVENTS_ADDRESS_3 || !process.env.RAWDB_VEHICLE_EVENTS_PORT) {
			throw new Error('Missing RAWDB_VEHICLE_EVENTS_ADDRESS_1, RAWDB_VEHICLE_EVENTS_ADDRESS_2, RAWDB_VEHICLE_EVENTS_ADDRESS_3 or RAWDB_VEHICLE_EVENTS_PORT environment variable.');
		}

		//
		// Check if the SSH Tunnel is required based on the environment.
		// In 'production' and 'staging', we assume direct connection is used.

		if (process.env.ENVIRONMENT === 'production' || process.env.ENVIRONMENT === 'staging') {
			return `mongodb://${process.env.RAWDB_VEHICLE_EVENTS_USER}:${process.env.RAWDB_VEHICLE_EVENTS_PASSWORD}@${process.env.RAWDB_VEHICLE_EVENTS_ADDRESS_1}:${process.env.RAWDB_VEHICLE_EVENTS_PORT},${process.env.RAWDB_VEHICLE_EVENTS_ADDRESS_2}:${process.env.RAWDB_VEHICLE_EVENTS_PORT},${process.env.RAWDB_VEHICLE_EVENTS_ADDRESS_3}:${process.env.RAWDB_VEHICLE_EVENTS_PORT}/`;
		}

		//
		// If we're here, then the SSH Tunnel is to be used.
		// Check if the required SSH Tunnel environment variables are set.

		if (!process.env.RAWDB_TUNNEL_LOCAL_PORT) {
			throw new Error('Missing RAWDB_TUNNEL_LOCAL_PORT environment variable.');
		}

		if (!process.env.RAWDB_TUNNEL_SSH_HOST || !process.env.RAWDB_TUNNEL_SSH_USERNAME) {
			throw new Error('Missing RAWDB_TUNNEL_SSH_HOST or RAWDB_TUNNEL_SSH_USERNAME environment variable.');
		}

		//
		// Setup the SSH Tunnel connection configuration

		const sshConfig: SshConfig = {
			forwardOptions: {
				dstAddr: process.env.RAWDB_VEHICLE_EVENTS_ADDRESS_1,
				dstPort: Number(process.env.RAWDB_VEHICLE_EVENTS_PORT),
				srcAddr: 'localhost',
				srcPort: Number(process.env.RAWDB_TUNNEL_LOCAL_PORT),
			},
			serverOptions: {
				port: Number(process.env.RAWDB_TUNNEL_LOCAL_PORT),
			},
			sshOptions: {
				/**
				 * Using SSH Agent for authentication.
				 * Ensure that your SSH key is added to the SSH agent beforehand.
				 * @see https://developer.1password.com/docs/ssh/agent/compatibility/#ssh-auth-sock
				 */
				agent: process.env.SSH_AUTH_SOCK,
				host: process.env.RAWDB_TUNNEL_SSH_HOST,
				keepaliveCountMax: 3, // Retry 3 times before closing the connection
				keepaliveInterval: 10_000, // Send keep-alive every 10 seconds
				port: 22,
				username: process.env.RAWDB_TUNNEL_SSH_USERNAME,
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

		if (!GLOBAL_RAWDB_TUNNEL_INSTANCE) {
			GLOBAL_RAWDB_TUNNEL_INSTANCE = new SshTunnelService(sshConfig, sshOptions);
		}

		Logger.info('Setting up SSH Tunnel for RAWDB VehicleEvents...');

		const sshTunnelConnection = await GLOBAL_RAWDB_TUNNEL_INSTANCE.connect();

		//
		// Construct the RAWDB connection string using the SSH Tunnel local address

		const localAddress = sshTunnelConnection.address();

		if (!localAddress || typeof localAddress !== 'object') {
			throw new Error('Failed to retrieve the SSH tunnel address for RAWDB VehicleEvents.');
		}

		return `mongodb://${process.env.RAWDB_VEHICLE_EVENTS_USER}:${process.env.RAWDB_VEHICLE_EVENTS_PASSWORD}@localhost:${localAddress.port}/`;

		//
	}

	//
}

/* * */

export const rawdbVehicleEvents = new RAWDBVehicleEventsClass();
