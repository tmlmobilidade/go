/* * */

import { mimeTypes } from '@tmlmobilidade/consts';
import { files } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import fs from 'fs';

import { DatabaseConfig, getDatabasePath } from './database.js';

/* * */
/* SAVE DATABASE TO STORAGE */
export async function saveDatabaseToStorage(config: DatabaseConfig): Promise<void> {
	const databasePath = getDatabasePath(config);
	const databaseName = config.agency_id ? `${config.database_name}-${config.agency_id}` : config.database_name;

	Logger.info({ message: `Saving the SQLite database to the storage service...` });
	Logger.info({ message: `File saved in: ${databasePath}` });

	const fileStream = fs.createReadStream(databasePath);
	const fileStats = fs.statSync(databasePath);

	const fileResult = await files.upload(fileStream, {
		_id: databaseName,
		created_by: 'system',
		name: `${databaseName}.db`,
		resource_id: 'Demand-Response-Transportation',
		scope: 'plans',
		size: fileStats.size,
		type: mimeTypes.sqlite,
		updated_by: 'system',
	}, { override: true });

	Logger.success(`SQLite database saved to the storage service. (${fileResult._id})`);
}

/* * */
/* SAVE ALL AGENCY DATABASES TO STORAGE */
export async function saveAllAgencyDatabasesToStorage(baseConfig: Omit<DatabaseConfig, 'agency_id'>, agencyIds: string[]): Promise<void> {
	for (const agencyId of agencyIds) {
		const config: DatabaseConfig = { ...baseConfig, agency_id: agencyId };
		await saveDatabaseToStorage(config);
	}
}
