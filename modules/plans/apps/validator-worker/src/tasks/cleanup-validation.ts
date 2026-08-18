import { Logger } from '@tmlmobilidade/logger';
import fs from 'node:fs';

/** Removes one validation workspace without failing an otherwise completed run. */
export function cleanupValidation(tempWorkdirPath: string) {
	try {
		fs.rmSync(tempWorkdirPath, { force: true, recursive: true });
		Logger.info({ message: 'Cleaned up temporary files.' });
	} catch (error) {
		Logger.error({ error, message: 'Error during cleanup of temporary files:' });
	}
}
