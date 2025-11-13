// configLoader.ts
import * as fs from 'fs';
import * as yaml from 'yaml';

import { AppConfig } from './config-types.js';

function validateConfig(config: AppConfig) {
	//

	//
	// Validate storage configuration
	if (!config.storage) {
		throw new Error('Missing required field \'storage\' configuration.');
	}

	if (config.storage.type !== 'oci') {
		throw new Error('Invalid storage type. Supported types are \'oci\'.');
	}

	if (config.storage.type === 'oci') {
		if (!config.storage.oci_config) {
			throw new Error('Storage type is \'oci\' but \'oci_config\' is missing.');
		}

		const keys_missing: string[] = [];
		for (const key of ['user', 'fingerprint', 'tenancy', 'region', 'private_key', 'namespace', 'bucket_name']) {
			if (!config.storage.oci_config[key]) {
				keys_missing.push(key);
			}
		}
		if (keys_missing.length > 0) {
			throw new Error(`Missing required fields in 'oci_config'. Ensure ${keys_missing.join(', ')} are set.`);
		}
	}

	//
	// Validate database configuration
	if (!config.database) {
		throw new Error('Missing required field \'database\' configuration.');
	}

	if (config.database.type !== 'mongodb' && config.database.type !== 'postgres') {
		throw new Error('Invalid database type. Supported types are \'mongodb\' and \'postgres\'.');
	}

	if (config.database.type === 'mongodb') {
		if (!config.database.mongodb_config) {
			throw new Error('Database type is \'mongodb\' but \'mongodb_config\' is missing.');
		}
		if (!config.database.mongodb_config.uri) {
			throw new Error('Missing required field \'uri\' in \'mongodb_config\'.');
		}
	}
	else if (config.database.type === 'postgres') {
		if (!config.database.postgres_config) {
			throw new Error('Database type is \'postgres\' but \'postgres_config\' is missing.');
		}
		if (!config.database.postgres_config.uri) {
			throw new Error('Missing required field \'uri\' in \'postgres_config\'.');
		}
	}

	//
	// Validate Backup configuration
	if (!config.backup) {
		throw new Error('Missing required field \'backup\' configuration.');
	}

	if (!config.backup.interval) {
		throw new Error('Missing required field \'interval\' in \'backup\' configuration.');
	}
	else if (config.backup.interval <= 0 || typeof config.backup.interval !== 'number') {
		throw new Error('\'interval\' must be a number greater than 0 in \'backup\' configuration.');
	}

	if (!config.backup.destination) {
		throw new Error('Missing required field \'destination\' in \'backup\' configuration.');
	}

	if (!config.backup.max_local_backups) {
		console.warn('\'max_local_backups\' is not set in \'backup\' configuration. No backups will be deleted.');
	}
	else if (config.backup.max_local_backups <= 0 || typeof config.backup.max_local_backups !== 'number') {
		throw new Error('\'max_local_backups\' must be a number greater than 0 in \'backup\' configuration.');
	}

	if (!config.backup.max_remote_backups) {
		console.warn('\'max_remote_backups\' is not set in \'backup\' configuration. No backups will be stored in the device storage.');
	}
	else if (config.backup.max_remote_backups <= 0 || typeof config.backup.max_remote_backups !== 'number') {
		throw new Error('\'max_remote_backups\' must be a number greater than 0 in \'backup\' configuration.');
	}
	else if (!config.backup.remote_destination) {
		throw new Error('\'remote_destination\' is not set in \'backup\' configuration.');
	}

	//
	// Validate Email configuration
	if (!config.email) {
		console.warn('\'email\' configuration is not set. No email will be sent.');
	}
	else {
		const { mail_options, send_failure, send_success, smtp } = config.email;
		if (typeof send_success !== 'boolean') {
			throw new Error('\'email.send_success\' should be a boolean.');
		}
		if (typeof send_failure !== 'boolean') {
			throw new Error('\'email.send_failure\' should be a boolean.');
		}

		if (!mail_options) {
			throw new Error('Missing \'mail_options\' in email configuration.');
		}
		else {
			if (!mail_options.from || typeof mail_options.from !== 'string') {
				throw new Error('\'from\' in \'mail_options\' configuration should be a string.');
			}
			if (!mail_options.subject || typeof mail_options.subject !== 'string') {
				throw new Error('\'subject\' in \'mail_options\' configuration should be a string.');
			}
			if (!mail_options.to || (typeof mail_options.to !== 'string' && !Array.isArray(mail_options.to))) {
				throw new Error('\'to\' in \'mail_options\' configuration should be a string or an array of strings.');
			}
		}

		if (!smtp) {
			throw new Error('Missing \'smtp\' configuration in email.');
		}
		else {
			const { host, port } = smtp;
			if (!host) {
				throw new Error('Missing \'host\' in \'smtp\' configuration.');
			}
			if (typeof port !== 'number' || port <= 0) {
				throw new Error('\'smtp.port\' should be a positive number.');
			}
			if (!smtp.auth.user) {
				throw new Error('Missing \'user\' in \'smtp.auth\' configuration.');
			}
			if (!smtp.auth.pass) {
				throw new Error('Missing \'password\' in \'smtp.auth\' configuration.');
			}
		}
	}
}

export function loadConfig(path: string): AppConfig {
	try {
		const fileContents = fs.readFileSync(path, 'utf8');
		const config = yaml.parse(fileContents) as AppConfig;

		// Validate the parsed configuration
		validateConfig(config);

		return config;
	}
	catch (error) {
		if (error instanceof SyntaxError) {
			throw new Error(`YAML Syntax Error in config file: ${error.message}`);
		}
		else if (error.code === 'ENOENT') {
			throw new Error(`Configuration file not found at path: ${path}`);
		}
		else {
			throw new Error(`Failed to load configuration: ${error.message}`);
		}
	}
}
