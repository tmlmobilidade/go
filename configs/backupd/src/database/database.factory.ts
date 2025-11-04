/* eslint-disable @typescript-eslint/no-extraneous-class */
import { IDatabaseService } from './database.interface.js';
import { MongoDbConfig, MongoDbService } from './mongo.service.js';
import { PostgresConfig, PostgresService } from './postgres.service.js';

export interface DatabaseConfiguration {
	mongodb_config?: MongoDbConfig
	postgres_config?: PostgresConfig
	type: 'mongodb' | 'postgres'
}

export class DatabaseFactory {
	/**
     * Creates and returns an instance of a database service based on the provided configuration.
     *
     * @param config - The database configuration object.
     * @returns An instance of a class that implements IDatabaseService.
     */
	public static create(config: DatabaseConfiguration): IDatabaseService {
		switch (config.type) {
			case 'mongodb':
				if (!config.mongodb_config || !config.mongodb_config.uri) {
					throw new Error('MongoDB configuration is missing or incomplete.');
				}
				return MongoDbService.getInstance(config.mongodb_config);
			case 'postgres':
				if (!config.postgres_config || !config.postgres_config.uri) {
					throw new Error('PostgreSQL configuration is missing or incomplete.');
				}
				return new PostgresService(config.postgres_config);
			default:
				throw new Error(`Unsupported database type: ${config.type}`);
		}
	}
}
