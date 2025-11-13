/* * */

import { IDatabaseService } from '@/database/database.interface.js';
import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Client, type ClientConfig } from 'pg';

/* * */

export interface PostgresConfig {
	options?: ClientConfig
	uri: string
}

export class PostgresService implements IDatabaseService {
	private client: InstanceType<typeof Client>;

	constructor(config: PostgresConfig) {
		this.client = new Client({ connectionString: config.uri, ...config.options });
	}

	/**
     * Backs up the database to the specified output path.
     */
	async backup(outputPath: string): Promise<void> {
		return new Promise((resolve, reject) => {
			// Ensure the output directory exists
			const outputDir = path.dirname(outputPath);
			if (!fs.existsSync(outputDir)) {
				fs.mkdirSync(outputDir, { recursive: true });
			}

			// Prepare the pg_dump command arguments
			const args = [
				'--dbname', this.client.database,
				'--format', 'custom',
				'--file', outputPath,
			];

			// Spawn the pg_dump process
			const dump = spawn('pg_dump', args);

			dump.stdout.on('data', (data) => {
				console.log(`pg_dump stdout: ${data}`);
			});

			dump.stderr.on('data', (data) => {
				console.error(`pg_dump stderr: ${data}`);
			});

			dump.on('close', (code) => {
				if (code === 0) {
					console.log(`Backup completed successfully. File saved to ${outputPath}`);
					resolve();
				}
				else {
					reject(new Error(`pg_dump exited with code ${code}`));
				}
			});

			dump.on('error', (err) => {
				reject(err);
			});
		});
	}

	/**
     * Connects to the PostgreSQL database.
     */
	async connect(): Promise<void> {
		await this.client.connect();
		console.log('Connected to PostgreSQL.');
	}

	/**
     * Disconnects from the PostgreSQL database.
     */
	async disconnect(): Promise<void> {
		await this.client.end();
		console.log('Disconnected from PostgreSQL.');
	}

	/**
     * Restores the database from the provided backup file.
     */
	async restore(backupPath: string): Promise<void> {
		const command = `pg_restore --dbname="${this.client.database}" --file="${backupPath}"`;
		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error(`⤷ Error running pg_restore: ${stderr}`);
			}
		});
	}
}
