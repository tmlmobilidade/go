import type { MongoConfig } from '../config/config-loader.js';

import { execCommand } from '../utils/exec.js';
import { logger } from '../utils/logger.js';

export interface RestoreOptions {
	config: MongoConfig
	dumpPath: string
}

export async function restoreMongoDB(options: RestoreOptions): Promise<void> {
	const { config, dumpPath } = options;

	logger.verbose(`Restore dump path: ${dumpPath}`);
	logger.verbose(`Host: ${config.host}`);
	logger.verbose(`Database: ${config.database}`);
	logger.verbose(`Auth database: ${config.authDatabase}`);

	// Full restore: drop existing database and restore
	const restoreCmd = `mongorestore \
		--host=${config.host} \
		--username=${config.username} \
		--password=${config.password} \
		--authenticationDatabase=${config.authDatabase} \
		--db=${config.database} \
		--drop \
		--gzip \
		--numParallelCollections=4 \
		--archive=${dumpPath}\\production.dump`;

	try {
		await execCommand(restoreCmd);
		logger.success('MongoDB restore completed successfully');
	}
	catch (error) {
		logger.error(`Failed to restore MongoDB: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}
}
