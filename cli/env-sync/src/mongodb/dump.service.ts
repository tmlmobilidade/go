import type { MongoConfig } from '../config/config-loader.js';

import { existsSync, mkdirSync } from 'fs';

import { execCommand } from '../utils/exec.js';
import { logger } from '../utils/logger.js';

export interface DumpOptions {
	config: MongoConfig
	excludeCollections?: string[]
	outputPath: string
	useReplicaSet?: boolean
}

export async function dumpMongoDB(options: DumpOptions): Promise<void> {
	const { config, excludeCollections = [], outputPath, useReplicaSet = false } = options;

	// Ensure output directory exists
	if (!existsSync(outputPath)) {
		mkdirSync(outputPath, { recursive: true });
	}

	// Build mongodump command for full database dump
	logger.info('Dumping production database...');
	logger.verbose(`Output path: ${outputPath}`);
	logger.verbose(`Host: ${config.host}`);
	logger.verbose(`Database: ${config.database}`);
	logger.verbose(`Auth database: ${config.authDatabase}`);
	if (excludeCollections.length > 0) {
		logger.verbose(`Excluding collections: ${excludeCollections.join(', ')}`);
	}

	let dumpCmd = `mongodump \
		--host=${config.host} \
		--username=${config.username} \
		--password=${config.password} \
		--authenticationDatabase=${config.authDatabase} \
		--db=${config.database} \
		--gzip \
		--archive=${outputPath}\\production.dump`;

	if (useReplicaSet) {
		dumpCmd += ' --readPreference=secondary';
		logger.verbose('Using replica set mode with secondary read preference');
	}

	// Add exclude collections if configured
	for (const collection of excludeCollections) {
		dumpCmd += ` --excludeCollection=${collection}`;
	}

	try {
		await execCommand(dumpCmd);
		logger.success('MongoDB dump completed successfully');
	}
	catch (error) {
		logger.error(`Failed to dump MongoDB: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}
}
