import type { SyncConfig } from '../config/config-loader.js';

import { logger } from '../utils/logger.js';
import { syncStorage } from './rclone.service.js';

export async function syncStorageService(config: SyncConfig): Promise<void> {
	try {
		await syncStorage(config.storage);
	}
	catch (error) {
		logger.error(`Storage sync failed: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}
}
