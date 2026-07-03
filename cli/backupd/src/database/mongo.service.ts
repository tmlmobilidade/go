import { ZipArchive } from 'archiver';
import { exec } from 'child_process';
import fs from 'fs';
import { Collection, Db, DbOptions, MongoClient, MongoClientOptions } from 'mongodb';
import path from 'path';

import { IDatabaseService } from './database.interface.js';

export interface MongoDbConfig {
	/** Options to control dump behavior */
	dump_options?: {
		database?: string
		exclude_collections?: string[]
	}
	options?: MongoClientOptions
	uri: string
}

export class MongoDbService implements IDatabaseService {
	private static _instance: MongoDbService;

	private _client: MongoClient;
	private _dumpOptions?: MongoDbConfig['dump_options'];
	private _uri: string;

	constructor(config: MongoDbConfig) {
		this._client = new MongoClient(config.uri, config.options);
		this._uri = config.uri;
		this._dumpOptions = config.dump_options;

		this._client.on('close', () => {
			console.warn('MongoDB connection closed unexpectedly.');
		});
		this._client.on('reconnect', () => {
			console.log('MongoDB reconnected.');
		});
	}

	get client(): MongoClient {
		return this._client;
	}

	/**
   * Get the singleton instance of MongoDbService.
   */
	public static getInstance(config?: MongoDbConfig): MongoDbService {
		if (!MongoDbService._instance) {
			if (!config?.uri) {
				throw new Error('MongoDB URI is required');
			}

			MongoDbService._instance = new MongoDbService(config);
		}

		return MongoDbService._instance;
	}

	/**
	 * Perform a MongoDB dump using mongodump command.
	 * @param outputPath - The directory path where the dump will be saved.
	 * @returns A promise that resolves on successful dump or rejects on error.
	 */
	async backup(outputPath: string): Promise<void> {
		const dumpDir = path.resolve(outputPath);

		return new Promise((resolve, reject) => {
			const excludeFlags = this._dumpOptions?.exclude_collections?.map(c => `--excludeCollection="${c}"`).join(' ') || '';
			const databaseFlag = this._dumpOptions?.database ? `--db="${this._dumpOptions.database}"` : '';

			const command = `mongodump --uri="${this._uri}" --out="${dumpDir}" ${excludeFlags} ${databaseFlag}`.trim();

			exec(command, (error, stdout, stderr) => {
				if (error) {
					console.error(`⤷ Error running mongodump: ${stderr}`);
					reject(new Error(`Mongodump failed: ${stderr}`));
				} else {
					console.log(`⤷ Mongodump completed successfully`);

					// Create a file to stream archive data to.
					const output = fs.createWriteStream(`${dumpDir}.zip`);
					const archive = new ZipArchive({
						zlib: { level: 9 }, // Sets the compression level.
					});

					archive.on('error', (err) => {
						console.error(`⤷ Error creating zip: ${err.message}`);
						reject(err);
					});

					// Pipe archive data to the file.
					archive.pipe(output);

					// Append files from the dump directory.
					archive.directory(dumpDir, false);

					// Finalize the archive (i.e., finish the compression).
					archive.finalize();

					// Remove the dump directory after zipping.
					output.on('close', () => {
						fs.rmSync(dumpDir, { recursive: true });
						console.log(`⤷ Backup has been zipped successfully. Total bytes: ${archive.pointer()}`);
						resolve();
					});
				}
			});
		});
	}

	/**
     * Connect to MongoDB and return the database instance.
     */
	async connect(): Promise<MongoClient> {
		if (!this._client) {
			try {
				await this._client.connect();
				console.log('⤷ Connected to MongoDB.');
			} catch (error) {
				throw new Error('Error connecting to MongoDB', { cause: error });
			}
		}
		return this._client;
	}

	/**
     * Create a new Db instance sharing the current socket connections.
     *
     * @param dbName - The name of the database we want to use. If not provided, use database name from connection string.
     * @param options - Optional settings for Db construction
     */
	db(dbName?: string, options?: DbOptions): Db {
		return this._client.db(dbName, options);
	}

	/**
   * Close the MongoDB connection.
   */
	async disconnect(): Promise<void> {
		if (this._client) {
			await this._client.close();
			console.log('⤷ Disconnected from MongoDB.');
		}
	}

	/**
     * Get a specific collection by name.
     * @param db - The database instance.
     * @param collectionName - The name of the collection to retrieve.
     * @returns The collection instance.
     */
	async getCollection<T>(db: Db, collectionName: string): Promise<Collection<T>> {
		return db.collection<T>(collectionName);
	}

	/**
     * Restores the database from the provided backup file.
     */
	async restore(backupPath: string): Promise<void> {
		const command = `mongorestore --uri="${this._uri}" --drop "${backupPath}"`;

		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error(`⤷ Error running mongorestore: ${stderr}`);
			} else {
				console.log(`⤷ Mongorestore completed successfully:\n${stdout}`);
			}
		});
	}
}
