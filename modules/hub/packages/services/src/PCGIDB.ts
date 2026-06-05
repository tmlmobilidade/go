/* * */

import { VehicleEvent } from '@tmlmobilidade/go-hub-pckg-types';
import { readFileSync } from 'fs';
import { Collection, Db } from 'mongodb';

import { MongoDbService } from './mongo.service.js';
import { SshConfig, SshTunnelService, SshTunnelServiceOptions } from './ssh-tunnel.service.js';

/* * */

const sshOptions: SshTunnelServiceOptions = {
	maxRetries: 3,
};

function buildSshConfig(privateKey: Buffer): SshConfig {
	return {
		forwardOptions: {
			dstAddr: process.env.PCGIDB_TUNNEL_REMOTE_HOST,
			dstPort: Number(process.env.PCGIDB_TUNNEL_REMOTE_PORT),
			srcAddr: process.env.PCGIDB_TUNNEL_LOCAL_HOST,
			srcPort: Number(process.env.PCGIDB_TUNNEL_LOCAL_PORT),
		},
		serverOptions: {
			port: Number(process.env.PCGIDB_TUNNEL_LOCAL_PORT),
		},
		sshOptions: {
			host: process.env.PCGIDB_SSH_HOST,
			keepaliveCountMax: 3, // Retry 3 times before closing the connection
			keepaliveInterval: 10000, // Send keep-alive every 10 seconds
			port: process.env.PCGIDB_SSH_PORT,
			privateKey,
			username: process.env.PCGIDB_SSH_USERNAME,
		},
		tunnelOptions: {
			autoClose: false,
			reconnectOnError: true,
		},
	};
}

class PCGIDBClass {
	private static _instance: PCGIDBClass;

	private coreManagementDatabase: Db;
	private mongoDbService: MongoDbService;
	private sshTunnelService: SshTunnelService;
	private validationsManagementDatabase: Db;

	private constructor() {
		//
	}

	get validationEntityCollection(): Collection {
		return this.validationsManagementDatabase.collection('validationEntity');
	}

	get vehicleEventsCollection(): Collection<VehicleEvent> {
		return this.coreManagementDatabase.collection<VehicleEvent>('VehicleEvents');
	}

	public static getInstance() {
		if (!PCGIDBClass._instance) {
			PCGIDBClass._instance = new PCGIDBClass();
		}

		return PCGIDBClass._instance;
	}

	async connect() {
		try {
			const keyPath = process.env.PCGIDB_SSH_KEY_PATH?.trim();
			if (!keyPath) {
				throw new Error('Missing PCGIDB_SSH_KEY_PATH environment variable.');
			}
			let privateKey: Buffer;
			try {
				privateKey = readFileSync(keyPath);
			} catch (cause) {
				throw new Error(`Failed to read PCGIDB SSH private key at ${keyPath}`, { cause });
			}

			this.sshTunnelService = new SshTunnelService(buildSshConfig(privateKey), sshOptions);

			// Connect to the SSH tunnel
			await this.sshTunnelService.connect();

			if (this.sshTunnelService.server) {
				// Connect to the MongoDB service
				this.mongoDbService = MongoDbService.getInstance(process.env.PCGIDB_MONGODB_URI, {
					connectTimeoutMS: 999000,
					directConnection: true,
					maxPoolSize: 200,
					minPoolSize: 2,
					readPreference: 'secondaryPreferred',
					serverSelectionTimeoutMS: 999000,
				});

				await this.mongoDbService.connect();

				// Connect to databases
				this.coreManagementDatabase = this.mongoDbService.db('CoreManagement');
				this.validationsManagementDatabase = this.mongoDbService.db('ValidationsManagement');

				console.log(`⤷ Connected to PCGIDB.`);
			}
		} catch (error) {
			throw new Error('Error connecting to PCGIDB', { cause: error });
		}
	}
}

export const PCGIDB = PCGIDBClass.getInstance();
