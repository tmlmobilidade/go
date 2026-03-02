import { StorageConfiguration, StorageFactory } from '@tmlmobilidade/interfaces';

import { BackupService } from './backup/backup.service.js';
import { loadConfig } from './config/config-loader.js';
import { DatabaseConfiguration, DatabaseFactory } from './database/database.factory.js';
import { MailerService } from './mailer/mailer.service.js';

async function main() {
	const config = loadConfig(process.env.CONFIG_PATH || './config.yaml');

	const databaseConfig: DatabaseConfiguration = {
		mongodb_config: config.database.mongodb_config,
		postgres_config: config.database.postgres_config,
		type: config.database.type,
	};

	const storageConfig: StorageConfiguration = {
		oci_config: config.storage.oci_config,
		type: config.storage.type,
	};

	// Create database and storage services
	const database = DatabaseFactory.create(databaseConfig);
	const storage = StorageFactory.create(storageConfig);
	const backup = new BackupService(config.backup, database, storage);
	const mailer = new MailerService(config.email);

	console.log('Running backup...');

	try {
		// Connect to the database
		await database.connect();

		// Perform backup
		await backup.backup();

		if (config.email?.send_success) {
			await mailer.sendSuccessMail();
		}
	} catch (error) {
		console.error('Error during backup:', error);

		if (config.email?.send_failure) {
			await mailer.sendFailureMail(error.message);
		}
	} finally {
		// Disconnect from the database
		await database.disconnect();
	}

	await new Promise(resolve => setTimeout(resolve, config.backup.interval * 1000 * 60));
	main();
}

main().catch(async (err) => {
	console.error(err);
	await new Promise(resolve => setTimeout(resolve, 1000 * 60)); // Wait for 1 minute before running again
	main();
});
