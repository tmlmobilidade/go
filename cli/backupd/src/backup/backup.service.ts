import { IDatabaseService } from '@/database/database.interface.js';
import { IStorageProvider } from '@tmlmobilidade/go-interfaces';
import fs from 'fs';
import path from 'path';

export interface BackupConfig {
	destination: string
	interval: number
	max_local_backups: number
	max_remote_backups: number
	remote_destination: string
}

export class BackupService {
	private readonly config: BackupConfig;
	private readonly databaseService: IDatabaseService;
	private readonly storageService: IStorageProvider;

	constructor(config: BackupConfig, databaseService: IDatabaseService, storageService: IStorageProvider) {
		this.config = config;
		this.databaseService = databaseService;
		this.storageService = storageService;
	}

	/**
	 * Perform a backup of the database and upload it to the storage.
	 */
	public async backup(): Promise<void> {
		// Create a backup directory with the current timestamp
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const backupDir = path.join(this.config.destination, timestamp);
		fs.mkdirSync(backupDir, { recursive: true });

		// Perform backup
		await this.databaseService.backup(backupDir);

		// Upload backup to storage
		const backupFile = fs.readFileSync(backupDir + '.zip');
		await this.storageService.uploadFile(path.join(this.config.remote_destination, timestamp + '.zip'), backupFile);

		// Delete old backups
		console.log('Deleting old backups...', {
			max_local_backups: this.config.max_local_backups,
			max_remote_backups: this.config.max_remote_backups,
		});
		if (this.config.max_local_backups > 0) {
			await this.deleteLocalBackups();
		}
		else if (this.config.max_local_backups === 0) { // Delete all local backups
			fs.rmSync(this.config.destination, { recursive: true });
		}

		if (this.config.max_remote_backups > 0) {
			await this.deleteRemoteBackups();
		}
	}

	/**
	 * Delete old backups from the local storage.
	 */
	private async deleteLocalBackups(): Promise<void> {
		// Delete old local backups
		const localBackups = fs.readdirSync(this.config.destination).sort();
		if (localBackups.length > this.config.max_local_backups) {
			// Delete oldest local backups first
			const localBackupsToDelete = localBackups.slice(0, localBackups.length - this.config.max_local_backups);
			for (const backup of localBackupsToDelete) {
				fs.rmSync(path.join(this.config.destination, backup), { recursive: true });
			}
		}
	}

	/**
	 * Delete old backups from the local storage.
	 */
	private async deleteRemoteBackups(): Promise<void> {
		const backups = await this.storageService.listFiles(this.config.remote_destination);
		backups.sort(); // Sort by timestamp since they're ISO format strings
		if (backups.length > this.config.max_remote_backups) {
			const backupsToDelete = backups.slice(0, backups.length - this.config.max_remote_backups);
			await Promise.all(backupsToDelete.map(backup => this.storageService.deleteFile(backup)));
		}
	}
}
